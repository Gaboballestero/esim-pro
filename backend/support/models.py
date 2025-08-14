from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SupportCategory(models.Model):
    """Categorías de soporte"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='help-circle-outline')
    color = models.CharField(max_length=7, default='#007AFF')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Support Categories'
    
    def __str__(self):
        return self.name


class SupportTicket(models.Model):
    """Tickets de soporte"""
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Abierto'),
        ('in_progress', 'En Progreso'),
        ('waiting_customer', 'Esperando Cliente'),
        ('resolved', 'Resuelto'),
        ('closed', 'Cerrado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    category = models.ForeignKey(SupportCategory, on_delete=models.SET_NULL, null=True, blank=True)
    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Información del dispositivo/contexto
    device_info = models.JSONField(default=dict, blank=True)
    app_version = models.CharField(max_length=50, blank=True)
    
    # Seguimiento
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tickets',
        limit_choices_to={'is_staff': True}
    )
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.ticket_id} - {self.subject[:50]}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_id:
            # Generar ID único para el ticket
            import uuid
            self.ticket_id = f"ESP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class SupportMessage(models.Model):
    """Mensajes en los tickets"""
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Null para mensajes del sistema
    message = models.TextField()
    is_internal = models.BooleanField(default=False)  # Nota interna del staff
    is_system = models.BooleanField(default=False)  # Mensaje automático del sistema
    
    # Archivos adjuntos
    attachments = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message for {self.ticket.ticket_id} by {self.user.email}"


class FAQ(models.Model):
    """Preguntas frecuentes"""
    category = models.ForeignKey(SupportCategory, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    tags = models.JSONField(default=list, blank=True)  # Para búsquedas
    
    # SEO y orden
    order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order', '-is_featured', '-view_count']
    
    def __str__(self):
        return self.question[:100]


class ChatSession(models.Model):
    """Sesiones de chat en vivo"""
    STATUS_CHOICES = [
        ('waiting', 'Esperando'),
        ('active', 'Activo'),
        ('ended', 'Finalizado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    session_id = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')
    
    # Agente asignado
    agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_agent_sessions',
        limit_choices_to={'is_staff': True}
    )
    
    # Metadata
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Fechas
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Chat {self.session_id} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.session_id:
            import uuid
            self.session_id = f"CHAT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


class ChatMessage(models.Model):
    """Mensajes del chat en vivo"""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Texto'),
            ('image', 'Imagen'),
            ('file', 'Archivo'),
            ('system', 'Sistema'),
        ],
        default='text'
    )
    
    # Metadata
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message in {self.session.session_id} by {self.user.email}"


class SupportKnowledgeBase(models.Model):
    """Base de conocimientos"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.ForeignKey(SupportCategory, on_delete=models.CASCADE)
    tags = models.JSONField(default=list, blank=True)
    
    # SEO
    slug = models.SlugField(unique=True)
    meta_description = models.CharField(max_length=160, blank=True)
    
    # Estadísticas
    view_count = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)
    
    # Status
    is_published = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-featured', '-view_count', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def helpful_percentage(self):
        total = self.helpful_count + self.not_helpful_count
        if total == 0:
            return 0
        return round((self.helpful_count / total) * 100, 1)
