import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esim_backend.settings')
django.setup()

from django.contrib.auth.models import User
from support.models import SupportCategory, FAQ, SupportTicket, SupportMessage

def create_sample_data():
    # Crear un usuario de prueba
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@esimpro.com',
            'first_name': 'Usuario',
            'last_name': 'Prueba',
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print("✅ Usuario de prueba creado")
    
    # Crear categorías de soporte
    categories_data = [
        {
            'name': 'eSIM y Activación',
            'description': 'Problemas con activación y configuración de eSIMs',
            'icon': 'sim-outline',
            'color': '#3B82F6',
            'order': 1
        },
        {
            'name': 'Pagos y Facturación',
            'description': 'Problemas con pagos, reembolsos y facturación',
            'icon': 'card-outline',
            'color': '#10B981',
            'order': 2
        },
        {
            'name': 'Cobertura y Conexión',
            'description': 'Problemas de conectividad y cobertura',
            'icon': 'wifi-outline',
            'color': '#F59E0B',
            'order': 3
        },
        {
            'name': 'Soporte Técnico',
            'description': 'Problemas técnicos generales',
            'icon': 'build-outline',
            'color': '#EF4444',
            'order': 4
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = SupportCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        categories.append(category)
        if created:
            print(f"✅ Categoría creada: {category.name}")
    
    # Crear FAQs de muestra
    faqs_data = [
        {
            'category': categories[0],  # eSIM y Activación
            'question': '¿Cómo activo mi eSIM en iPhone?',
            'answer': '''Para activar tu eSIM en iPhone:

1. Ve a Configuración > Datos móviles
2. Toca "Agregar plan de datos"
3. Escanea el código QR que recibiste por email
4. Sigue las instrucciones en pantalla
5. Tu eSIM se activará automáticamente

Nota: Asegúrate de tener iOS 12.1 o superior.''',
            'tags': ['iphone', 'activacion', 'esim', 'qr'],
            'is_featured': True,
            'view_count': 245
        },
        {
            'category': categories[0],
            'question': '¿Cómo activo mi eSIM en Android?',
            'answer': '''Para activar tu eSIM en Android:

1. Ve a Configuración > Conexiones > Gestión de SIM
2. Toca "Agregar plan móvil"
3. Escanea el código QR
4. Sigue las instrucciones
5. Activa el plan cuando esté listo

Nota: Compatible con Android 10+ y dispositivos compatibles.''',
            'tags': ['android', 'activacion', 'esim'],
            'is_featured': True,
            'view_count': 198
        },
        {
            'category': categories[1],  # Pagos
            'question': '¿Qué métodos de pago aceptan?',
            'answer': '''Aceptamos los siguientes métodos de pago:

• Tarjetas de crédito/débito (Visa, Mastercard, American Express)
• PayPal
• Apple Pay
• Google Pay
• Transferencias bancarias

Todos los pagos son seguros y encriptados.''',
            'tags': ['pagos', 'tarjeta', 'paypal'],
            'is_featured': True,
            'view_count': 156
        },
        {
            'category': categories[2],  # Cobertura
            'question': '¿En qué países funciona?',
            'answer': '''Nuestras eSIMs funcionan en más de 190 países:

🌍 Europa: Todos los países de la UE, Reino Unido, Suiza, Noruega
🌎 América: Estados Unidos, Canadá, México, Brasil, Argentina
🌏 Asia: Japón, Corea del Sur, Singapur, Tailandia, China
🌏 Oceanía: Australia, Nueva Zelanda

Verifica la cobertura específica al seleccionar tu plan.''',
            'tags': ['cobertura', 'paises', 'internacional'],
            'is_featured': True,
            'view_count': 312
        },
        {
            'category': categories[0],
            'question': '¿Puedo usar WhatsApp con mi eSIM?',
            'answer': '''¡Sí! Puedes usar WhatsApp normalmente:

• WhatsApp detectará automáticamente tu nueva conexión
• No necesitas cambiar tu número de teléfono
• Funciona con datos móviles de la eSIM
• Asegúrate de tener el roaming activado

WhatsApp funciona igual que con tu SIM física.''',
            'tags': ['whatsapp', 'aplicaciones', 'mensajeria'],
            'is_featured': False,
            'view_count': 89
        },
        {
            'category': categories[3],  # Técnico
            'question': '¿Qué hago si no tengo señal?',
            'answer': '''Si no tienes señal, intenta estos pasos:

1. 📱 Verifica que el roaming esté activado
2. 🔄 Reinicia tu dispositivo
3. 📡 Ve a Configuración > Red y selecciona operador manualmente
4. 💾 Verifica que tengas datos disponibles en tu plan
5. 📍 Confirma que estés en un área con cobertura

Si el problema persiste, contáctanos.''',
            'tags': ['señal', 'conectividad', 'troubleshooting'],
            'is_featured': False,
            'view_count': 134
        }
    ]
    
    for faq_data in faqs_data:
        faq, created = FAQ.objects.get_or_create(
            question=faq_data['question'],
            defaults=faq_data
        )
        if created:
            print(f"✅ FAQ creada: {faq.question[:50]}...")
    
    # Crear un ticket de ejemplo
    ticket_data = {
        'user': user,
        'category': categories[0],
        'subject': 'No puedo activar mi eSIM en iPhone',
        'description': 'Hola, compré un plan de 5GB para Europa pero cuando escaneo el código QR me dice que no es válido. ¿Pueden ayudarme?',
        'priority': 'medium',
        'status': 'open',
        'device_info': 'iPhone 14 Pro, iOS 17.1',
        'app_version': '1.0.0'
    }
    
    ticket, created = SupportTicket.objects.get_or_create(
        user=user,
        subject=ticket_data['subject'],
        defaults=ticket_data
    )
    
    if created:
        print(f"✅ Ticket creado: #{ticket.ticket_id}")
        
        # Crear mensaje de respuesta
        SupportMessage.objects.create(
            ticket=ticket,
            user=None,  # Sistema/Agente
            is_system=True,
            message='''Hola Usuario,

Gracias por contactarnos. Para ayudarte con la activación de tu eSIM, necesitamos verificar algunos detalles:

1. ¿El código QR lo recibiste por email después de la compra?
2. ¿Estás intentando escanearlo desde la app o desde Configuración?
3. ¿Te aparece algún mensaje de error específico?

Mientras tanto, aquí tienes una guía paso a paso:
https://ayuda.esimpro.com/activacion-iphone

Quedamos atentos a tu respuesta.

Saludos,
Equipo eSIM Pro'''
        )
        print("✅ Mensaje de respuesta creado")

if __name__ == '__main__':
    create_sample_data()
    print("\n🎉 ¡Datos de prueba creados exitosamente!")
    print("\n📊 Resumen:")
    print(f"- Categorías: {SupportCategory.objects.count()}")
    print(f"- FAQs: {FAQ.objects.count()}")
    print(f"- Tickets: {SupportTicket.objects.count()}")
    print(f"- Mensajes: {SupportMessage.objects.count()}")
