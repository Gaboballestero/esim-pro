# eSIM Pro 🌍

Una plataforma completa de gestión de eSIM para turistas, similar a Holafly, con interfaces web y móvil modernas.

![eSIM Pro](https://img.shields.io/badge/Version-1.0.0-blue)
![Django](https://img.shields.io/badge/Django-5.2+-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)

## 🚀 Características

### ✨ Para Usuarios
- **Autenticación simplificada** - Login/registro unificado
- **Tienda moderna** - Interfaz intuitiva con filtros avanzados
- **Dashboard completo** - Gestión de eSIMs y datos de uso
- **Compra integrada** - Flujo de compra con verificación de autenticación
- **Soporte multi-idioma** - Interfaz localizada  
- 🖥️ **Panel Admin** - Django Admin + Custom Dashboard (localhost:8000/admin)

## 🏗️ Arquitectura del Proyecto

```
Esim/
├── 📁 backend/              # Django REST API
│   ├── esim_backend/        # Configuración principal
│   ├── users/              # Gestión de usuarios
│   ├── esims/              # Gestión de eSIMs
│   ├── plans/              # Planes de datos
│   ├── payments/           # Procesamiento de pagos
│   └── requirements.txt    # Dependencias Python
├── 📁 frontend/            # Next.js Web App
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   ├── components/    # Componentes React
│   │   └── styles/        # Estilos Tailwind CSS
│   └── package.json       # Dependencias Node.js
├── 📁 mobile/             # React Native App
│   ├── src/
│   │   ├── screens/       # Pantallas móviles
│   │   ├── components/    # Componentes reutilizables
│   │   └── services/      # APIs y servicios
│   └── package.json       # Dependencias móviles
└── README.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### **Backend (API)**
- **Django 5.2+** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **Celery** - Tareas en background
- **Stripe/PayPal** - Procesamiento de pagos
- **Twilio** - SMS y notificaciones
- **AWS S3** - Almacenamiento de archivos

### **Frontend Web**
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones
- **React Query** - Estado del servidor
- **Zustand** - Estado global
- **React Hook Form** - Formularios

### **Mobile App**
- **React Native** - Desarrollo híbrido
- **Expo** - Herramientas de desarrollo
- **React Navigation** - Navegación
- **Native Base** - Componentes UI
- **AsyncStorage** - Almacenamiento local

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### **1. Configuración del Backend**

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver
```

### **2. Configuración del Frontend**

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Ejecutar servidor de desarrollo
npm run dev
```

### **3. Configuración de Mobile**

```bash
# Navegar al directorio mobile
cd mobile

# Instalar dependencias
npm install

# Para iOS
npx pod-install ios

# Ejecutar en desarrollo
npm run ios     # Para iOS
npm run android # Para Android
```

## 🔧 Variables de Entorno

### **Backend (.env)**
```env
SECRET_KEY=tu-clave-secreta-django
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/esim_db
REDIS_URL=redis://localhost:6379/0
STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
ESIM_API_KEY=tu_clave_api_esim
```

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_stripe
```

## 📚 API Endpoints

### **Autenticación**
- `POST /api/auth/register/` - Registro de usuario
- `POST /api/auth/login/` - Inicio de sesión
- `POST /api/auth/logout/` - Cerrar sesión
- `GET /api/auth/profile/` - Perfil de usuario

### **Planes**
- `GET /api/plans/` - Listar planes disponibles
- `GET /api/plans/{id}/` - Detalles de un plan
- `GET /api/plans/countries/` - Países disponibles

### **eSIMs**
- `GET /api/esims/` - eSIMs del usuario
- `POST /api/esims/` - Crear nueva eSIM
- `GET /api/esims/{id}/` - Detalles de eSIM
- `POST /api/esims/{id}/activate/` - Activar eSIM

### **Pagos**
- `POST /api/payments/create-intent/` - Crear intención de pago
- `POST /api/payments/confirm/` - Confirmar pago
- `GET /api/payments/orders/` - Historial de órdenes

## 🎨 Características de la UI

### **Diseño Moderno**
- 🎨 **Interfaz inspirada en Holafly** - Limpia y profesional
- 📱 **Responsive Design** - Funciona en todos los dispositivos
- 🌙 **Modo oscuro** - Para mejor experiencia nocturna
- ⚡ **Animaciones suaves** - Con Framer Motion
- 🎯 **UX optimizada** - Flujo de compra intuitivo

### **Componentes Principales**
- 🏠 **Landing Page** - Hero section atractivo
- 📊 **Dashboard** - Panel de control del usuario
- 💳 **Checkout** - Proceso de pago optimizado
- 📱 **eSIM Manager** - Gestión de eSIMs activas
- 📈 **Usage Analytics** - Estadísticas de uso

## 🔒 Seguridad

- 🛡️ **Autenticación JWT** - Tokens seguros
- 🔐 **Validación de entrada** - Prevención de ataques
- 🌐 **CORS configurado** - Acceso controlado
- 📝 **Logs detallados** - Monitoreo de actividad
- 🔒 **Cifrado de datos** - Información sensible protegida

## 📊 Base de Datos

### **Modelos Principales**
- **User** - Usuarios del sistema
- **DataPlan** - Planes de datos disponibles
- **ESim** - eSIMs individuales
- **Order** - Órdenes de compra
- **Payment** - Registros de pagos
- **Country** - Países con cobertura

## 🚢 Despliegue

### **Backend (Django)**
- **Heroku** - Despliegue fácil
- **AWS ECS** - Contenedores escalables
- **DigitalOcean** - VPS personalizable

### **Frontend (Next.js)**
- **Vercel** - Despliegue automático
- **Netlify** - CDN global
- **AWS S3 + CloudFront** - Hosting estático

### **Mobile (React Native)**
- **App Store** - iOS
- **Google Play Store** - Android
- **Expo Application Services** - Compilación automática

## 🤝 Integración con Proveedores eSIM

### **APIs Soportadas**
- 🌐 **Truphone** - Cobertura global
- 📡 **1Global** - Tarifas competitivas
- 🌎 **Airhub** - Múltiples operadores
- 📶 **eSIM.net** - API simple

### **Funcionalidades**
- ✅ Aprovisionamiento automático
- ✅ Activación instantánea
- ✅ Monitoreo de uso
- ✅ Renovación automática

## 📱 Funciones Móviles Destacadas

- 📸 **Escaneo QR** - Activación rápida
- 📍 **Detección de ubicación** - Planes sugeridos
- 💾 **Sincronización offline** - Funciona sin internet
- 🔔 **Push notifications** - Alertas importantes
- 📊 **Widgets nativos** - Información rápida

## 🌍 Internacionalización

- 🇪🇸 **Español** - Idioma principal
- 🇺🇸 **Inglés** - Mercado global
- 🇫🇷 **Francés** - Europa
- 🇩🇪 **Alemán** - DACH region
- 🇧🇷 **Portugués** - Brasil

## 📈 Analytics y Monitoreo

- 📊 **Google Analytics** - Seguimiento web
- 📱 **Firebase Analytics** - Apps móviles  
- 🔍 **Sentry** - Monitoreo de errores
- 📈 **Custom Dashboard** - Métricas de negocio

## 🧪 Testing

```bash
# Backend testing
python manage.py test

# Frontend testing  
npm run test

# E2E testing
npm run test:e2e
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- 📧 **Email**: soporte@esimpro.com
- 💬 **Discord**: [Únete a nuestro servidor](https://discord.gg/esimpro)
- 📚 **Documentación**: [docs.esimpro.com](https://docs.esimpro.com)

---

## 🚀 **¡Desarrollado con ❤️ para conectar el mundo!**

> **Nota**: Esta es una plataforma completa lista para producción. Incluye todas las funcionalidades necesarias para competir con Holafly y otros proveedores de eSIM.
