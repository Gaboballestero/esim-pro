from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    SupportCategory, SupportTicket, SupportMessage, FAQ, 
    ChatSession, ChatMessage, SupportKnowledgeBase
)


# Serializer temporal para User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class SupportCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'order']


class SupportMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SupportMessage
        fields = ['id', 'user', 'message', 'attachments', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category = SupportCategorySerializer(read_only=True)
    messages = SupportMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_id', 'user', 'category', 'subject', 'description',
            'priority', 'status', 'device_info', 'app_version',
            'created_at', 'updated_at', 'resolved_at', 'messages'
        ]
        read_only_fields = ['id', 'ticket_id', 'user', 'created_at', 'updated_at']


class SupportTicketCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'category_id', 'subject', 'description', 'priority',
            'device_info', 'app_version'
        ]
    
    def validate_priority(self, value):
        if value not in ['low', 'medium', 'high', 'urgent']:
            raise serializers.ValidationError('Prioridad inválida.')
        return value
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        user = self.context['request'].user
        
        ticket = SupportTicket.objects.create(
            user=user,
            category_id=category_id,
            **validated_data
        )
        
        return ticket


class FAQSerializer(serializers.ModelSerializer):
    category = SupportCategorySerializer(read_only=True)
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'category', 'question', 'answer', 'tags',
            'is_featured', 'view_count', 'created_at'
        ]


class ChatSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    agent = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'session_id', 'user', 'agent', 'status',
            'started_at', 'ended_at'
        ]
        read_only_fields = ['id', 'session_id', 'user', 'started_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'user', 'message', 'message_type', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class SupportKnowledgeBaseSerializer(serializers.ModelSerializer):
    category = SupportCategorySerializer(read_only=True)
    helpful_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = SupportKnowledgeBase
        fields = [
            'id', 'title', 'content', 'category', 'tags', 'slug',
            'view_count', 'helpful_count', 'not_helpful_count',
            'helpful_percentage', 'featured', 'created_at', 'updated_at'
        ]


class SupportStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de soporte"""
    total_tickets = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    resolved_tickets = serializers.IntegerField()
    avg_response_time = serializers.FloatField()
    satisfaction_rate = serializers.FloatField()
    popular_categories = serializers.ListField()
    recent_activity = serializers.ListField()


class QuickSupportSerializer(serializers.Serializer):
    """Serializer para soporte rápido via WhatsApp/Telegram"""
    message = serializers.CharField(max_length=500)
    contact_method = serializers.ChoiceField(choices=['whatsapp', 'telegram', 'email'])
    priority = serializers.ChoiceField(
        choices=['low', 'medium', 'high'],
        default='medium'
    )
    
    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                'El mensaje debe tener al menos 10 caracteres.'
            )
        return value.strip()
