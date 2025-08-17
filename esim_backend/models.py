from django.db import models

# Archivo de modelos básico para esim_backend
# Los modelos principales están en las apps individuales en /backend/

# Este archivo existe para evitar errores de Django cuando busca modelos en la app principal
class BasicModel(models.Model):
    """Modelo base - no se usa directamente"""
    class Meta:
        abstract = True