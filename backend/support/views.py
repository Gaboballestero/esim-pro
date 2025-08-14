from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import requests
import json

from .models import (
    SupportCategory, SupportTicket, SupportMessage, FAQ,
    ChatSession, ChatMessage, SupportKnowledgeBase
)
from .serializers import (
    SupportCategorySerializer, SupportTicketSerializer, SupportTicketCreateSerializer,
    SupportMessageSerializer, FAQSerializer, ChatSessionSerializer,
    ChatMessageSerializer, SupportKnowledgeBaseSerializer, SupportStatsSerializer,
    QuickSupportSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SupportCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para categorías de soporte"""
    queryset = SupportCategory.objects.all().order_by('order')
    serializer_class = SupportCategorySerializer
    permission_classes = []  # Sin autenticación para categorías


class SupportTicketViewSet(viewsets.ModelViewSet):
    """ViewSet para tickets de soporte"""
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Obtener tickets del usuario autenticado"""
        return SupportTicket.objects.filter(
            user=self.request.user
        ).select_related('category', 'user').prefetch_related('messages').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SupportTicketCreateSerializer
        return SupportTicketSerializer
    
    def perform_create(self, serializer):
        """Crear nuevo ticket"""
        ticket = serializer.save(user=self.request.user)
        
        # Enviar notificación por email
        self._send_ticket_notification(ticket)
        
        # Crear mensaje automático de bienvenida
        SupportMessage.objects.create(
            ticket=ticket,
            user=None,  # Sistema
            message=f"Hola {ticket.user.first_name or ticket.user.username}, hemos recibido tu solicitud de soporte. Te responderemos lo antes posible."
        )
    
    def _send_ticket_notification(self, ticket):
        """Enviar notificación de nuevo ticket"""
        try:
            subject = f'Nuevo ticket de soporte #{ticket.ticket_id}'
            message = f"""
            Se ha creado un nuevo ticket de soporte:
            
            Usuario: {ticket.user.username}
            Asunto: {ticket.subject}
            Prioridad: {ticket.get_priority_display()}
            
            Descripción:
            {ticket.description}
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.SUPPORT_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f"Error enviando notificación: {e}")
    
    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """Agregar mensaje a un ticket"""
        ticket = self.get_object()
        
        serializer = SupportMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(ticket=ticket, user=request.user)
            
            # Actualizar estado del ticket si estaba resuelto
            if ticket.status == 'resolved':
                ticket.status = 'open'
                ticket.save()
            
            return Response(SupportMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def close_ticket(self, request, pk=None):
        """Cerrar un ticket"""
        ticket = self.get_object()
        ticket.status = 'closed'
        ticket.resolved_at = timezone.now()
        ticket.save()
        
        return Response({'status': 'Ticket cerrado'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de tickets del usuario"""
        user_tickets = self.get_queryset()
        
        stats = {
            'total_tickets': user_tickets.count(),
            'open_tickets': user_tickets.filter(status__in=['open', 'in_progress']).count(),
            'resolved_tickets': user_tickets.filter(status='resolved').count(),
            'closed_tickets': user_tickets.filter(status='closed').count(),
            'avg_response_time': 2.5,  # En horas (placeholder)
            'last_ticket_date': user_tickets.first().created_at if user_tickets.exists() else None
        }
        
        return Response(stats)


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para preguntas frecuentes"""
    serializer_class = FAQSerializer
    permission_classes = []  # Sin autenticación para FAQs
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = FAQ.objects.select_related('category').order_by('-is_featured', '-view_count')
        
        # Filtrar por categoría
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Búsqueda por texto
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(question__icontains=search) |
                Q(answer__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Solo FAQs destacadas
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Incrementar contador de vistas al ver una FAQ"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Obtener FAQs más populares"""
        popular_faqs = FAQ.objects.order_by('-view_count')[:10]
        serializer = self.get_serializer(popular_faqs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Obtener categorías con conteo de FAQs"""
        categories = SupportCategory.objects.annotate(
            faq_count=Count('faq')
        ).filter(faq_count__gt=0)
        
        serializer = SupportCategorySerializer(categories, many=True)
        return Response(serializer.data)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet para sesiones de chat"""
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-started_at')
    
    def perform_create(self, serializer):
        """Crear nueva sesión de chat"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Obtener mensajes de una sesión de chat"""
        session = self.get_object()
        messages = ChatMessage.objects.filter(session=session).order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Enviar mensaje en una sesión de chat"""
        session = self.get_object()
        
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(session=session, user=request.user)
            return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """Finalizar sesión de chat"""
        session = self.get_object()
        session.status = 'ended'
        session.ended_at = timezone.now()
        session.save()
        
        return Response({'status': 'Sesión finalizada'}, status=status.HTTP_200_OK)


class SupportKnowledgeBaseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para base de conocimientos"""
    serializer_class = SupportKnowledgeBaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = SupportKnowledgeBase.objects.select_related('category').order_by('-featured', '-view_count')
        
        # Filtrar por categoría
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Búsqueda por texto
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(tags__icontains=search)
            )
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Incrementar contador de vistas"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, slug=None):
        """Marcar artículo como útil"""
        article = self.get_object()
        article.helpful_count += 1
        article.save(update_fields=['helpful_count'])
        
        return Response({'status': 'Marcado como útil'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def mark_not_helpful(self, request, slug=None):
        """Marcar artículo como no útil"""
        article = self.get_object()
        article.not_helpful_count += 1
        article.save(update_fields=['not_helpful_count'])
        
        return Response({'status': 'Marcado como no útil'}, status=status.HTTP_200_OK)


class QuickSupportView(viewsets.GenericViewSet):
    """ViewSet para soporte rápido"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def whatsapp(self, request):
        """Enviar mensaje rápido por WhatsApp"""
        serializer = QuickSupportSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.validated_data['message']
            user = request.user
            
            # Crear ticket automático
            ticket = SupportTicket.objects.create(
                user=user,
                subject='Soporte rápido via WhatsApp',
                description=message,
                priority=serializer.validated_data['priority']
            )
            
            # Enviar a WhatsApp Business API (placeholder)
            whatsapp_number = getattr(settings, 'WHATSAPP_BUSINESS_NUMBER', None)
            if whatsapp_number:
                whatsapp_url = f"https://wa.me/{whatsapp_number}?text={message}"
                return Response({
                    'status': 'success',
                    'ticket_id': ticket.ticket_id,
                    'whatsapp_url': whatsapp_url,
                    'message': 'Se ha creado tu ticket y puedes continuar en WhatsApp'
                })
            
            return Response({
                'status': 'success',
                'ticket_id': ticket.ticket_id,
                'message': 'Se ha creado tu ticket de soporte'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def telegram(self, request):
        """Enviar mensaje rápido por Telegram"""
        serializer = QuickSupportSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.validated_data['message']
            user = request.user
            
            # Crear ticket automático
            ticket = SupportTicket.objects.create(
                user=user,
                subject='Soporte rápido via Telegram',
                description=message,
                priority=serializer.validated_data['priority']
            )
            
            # Enviar a Telegram Bot (placeholder)
            telegram_username = getattr(settings, 'TELEGRAM_SUPPORT_USERNAME', None)
            if telegram_username:
                telegram_url = f"https://t.me/{telegram_username}?start={ticket.ticket_id}"
                return Response({
                    'status': 'success',
                    'ticket_id': ticket.ticket_id,
                    'telegram_url': telegram_url,
                    'message': 'Se ha creado tu ticket y puedes continuar en Telegram'
                })
            
            return Response({
                'status': 'success',
                'ticket_id': ticket.ticket_id,
                'message': 'Se ha creado tu ticket de soporte'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def contact_info(self, request):
        """Obtener información de contacto"""
        contact_info = {
            'whatsapp': getattr(settings, 'WHATSAPP_BUSINESS_NUMBER', None),
            'telegram': getattr(settings, 'TELEGRAM_SUPPORT_USERNAME', None),
            'email': getattr(settings, 'SUPPORT_EMAIL', 'support@esimpro.com'),
            'phone': getattr(settings, 'SUPPORT_PHONE', '+1-800-ESIM-PRO'),
            'hours': 'Lun-Vie 9:00-18:00, Sáb 10:00-14:00',
            'response_time': {
                'whatsapp': '2-5 minutos',
                'telegram': '2-5 minutos', 
                'email': '2-4 horas',
                'phone': 'Inmediato'
            }
        }
        
        return Response(contact_info)
