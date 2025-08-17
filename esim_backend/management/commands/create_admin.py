from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os


class Command(BaseCommand):
    help = 'Crear superusuario automáticamente para producción'

    def handle(self, *args, **options):
        # Credenciales para el admin
        username = 'admin'
        email = 'admin@hablaris.com'
        password = 'HablarisAdmin2025!'
        
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superusuario "{username}" creado exitosamente')
            )
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Contraseña: {password}')
        else:
            self.stdout.write(
                self.style.WARNING(f'El superusuario "{username}" ya existe')
            )
