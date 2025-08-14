# 🚀 Guía de Deployment Railway - Hablaris.com

## 📋 Configuración Completa para hablaris.com

### 1. **Preparación del Repositorio** ✅

Ya tienes configurado:
- ✅ `settings.py` con ALLOWED_HOSTS para hablaris.com
- ✅ CORS configurado para tu dominio
- ✅ Archivos de deployment (Procfile, railway.json, nixpacks.toml)
- ✅ Variables de entorno preparadas

### 2. **Subir a GitHub**

```bash
# Si no lo has hecho aún:
git add .
git commit -m "Configure hablaris.com domain settings"
git push -u origin main
```

### 3. **Deploy en Railway**

#### 3.1 Crear Proyecto
1. Ve a [railway.app](https://railway.app)
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona `esim-pro`
4. Railway detectará automáticamente Django

#### 3.2 Configurar Variables de Entorno
En Railway Dashboard → **Variables**:

```bash
# Core Django
DEBUG=False
SECRET_KEY=hablaris-esim-production-secret-key-2025-super-secure
DJANGO_SETTINGS_MODULE=esim_backend.settings

# Domain Configuration
ALLOWED_HOSTS=hablaris.com,www.hablaris.com,*.hablaris.com,*.railway.app
CORS_ALLOWED_ORIGINS=https://hablaris.com,https://www.hablaris.com

# Security (Railway maneja SSL automáticamente)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

#### 3.3 Base de Datos
Railway agregará automáticamente:
- `DATABASE_URL` (PostgreSQL)
- Las credenciales de BD se configuran automáticamente

### 4. **Configurar Dominio hablaris.com**

#### 4.1 En Railway Dashboard
1. **Settings** → **Domains**
2. **"Custom Domain"**
3. Ingresa: `hablaris.com`
4. Railway te dará registros DNS

#### 4.2 Configurar DNS en tu Proveedor
Necesitas configurar estos registros en donde tienes registrado hablaris.com:

```dns
# Para el dominio principal (hablaris.com)
Type: CNAME
Name: @
Value: tu-app.railway.app

# Para www.hablaris.com
Type: CNAME  
Name: www
Value: tu-app.railway.app

# Si Railway usa A record:
Type: A
Name: @
Value: [IP que te dé Railway]
```

### 5. **Configuración de Subdominios**

Si quieres separar frontend y backend:

#### Backend API: `api.hablaris.com`
```dns
Type: CNAME
Name: api
Value: tu-backend.railway.app
```

#### Frontend: `hablaris.com` o `app.hablaris.com`
- Puedes desplegar el frontend en Vercel/Netlify
- O en otro servicio Railway separado

### 6. **Variables de Entorno Específicas para Hablaris**

#### Backend (.env en Railway):
```bash
# Django Core
DEBUG=False
SECRET_KEY=hablaris-super-secret-production-key-2025
ALLOWED_HOSTS=hablaris.com,www.hablaris.com,api.hablaris.com,*.railway.app

# CORS para tu dominio
CORS_ALLOWED_ORIGINS=https://hablaris.com,https://www.hablaris.com,https://app.hablaris.com

# Base de datos (Railway lo configura automáticamente)
# DATABASE_URL=postgresql://user:pass@host:port/db

# Email (configurar después)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@hablaris.com
EMAIL_HOST_PASSWORD=tu-password-email

# APIs externas (configurar cuando tengas cuentas)
STRIPE_SECRET_KEY=sk_live_tu_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_tu_stripe_key
```

### 7. **Configuración SSL/HTTPS**

Railway maneja SSL automáticamente para:
- ✅ `*.railway.app` (automático)
- ✅ `hablaris.com` (automático una vez configurado DNS)
- ✅ `www.hablaris.com` (automático)

### 8. **Verificación del Deploy**

Una vez configurado, verifica:

```bash
# Verificar backend API
curl https://api.hablaris.com/api/ping/

# Verificar dominio principal
curl https://hablaris.com

# Verificar CORS
curl -H "Origin: https://hablaris.com" https://api.hablaris.com/api/plans/
```

### 9. **Configuraciones Post-Deploy**

#### 9.1 Crear Superusuario
En Railway → **Logs** → **Terminal**:
```bash
python manage.py createsuperuser
```

#### 9.2 Cargar Datos Iniciales
```bash
python manage.py loaddata initial_plans.json
```

#### 9.3 Verificar Admin
Accede a: `https://api.hablaris.com/admin/`

### 10. **Monitoreo y Logs**

- **Railway Dashboard** → **Logs**: Para ver logs en tiempo real
- **Railway Dashboard** → **Metrics**: Para ver uso de recursos
- **Health Check**: `https://api.hablaris.com/api/ping/`

### 11. **Configuración de Correo para hablaris.com**

Después del deploy, configura:

```bash
# Gmail Business o similar
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=noreply@hablaris.com
EMAIL_HOST_PASSWORD=tu-app-password

# O con un servicio como SendGrid
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=tu-sendgrid-key
```

### 12. **Frontend en Vercel (Recomendado)**

Para mejor rendimiento, deploy el frontend por separado:

1. **Conecta frontend a Vercel**
2. **Variables de entorno en Vercel**:
```bash
NEXT_PUBLIC_API_URL=https://api.hablaris.com
NEXT_PUBLIC_APP_URL=https://hablaris.com
```

### 13. **Checklist Final**

- [ ] ✅ Código subido a GitHub
- [ ] ✅ Proyecto creado en Railway
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ DNS configurado para hablaris.com
- [ ] ✅ SSL funcionando
- [ ] ✅ Superusuario creado
- [ ] ✅ API funcionando
- [ ] ✅ CORS configurado
- [ ] ✅ Base de datos migraciones aplicadas

### 🚨 **Importante: Configuración DNS**

**Debes configurar el DNS donde tienes registrado hablaris.com** (GoDaddy, Namecheap, etc.)

1. Accede al panel de control de tu dominio
2. Ve a **DNS Management** o **Zone Editor**
3. Agrega los registros que Railway te proporcione
4. Espera 24-48 horas para propagación completa

¿Tienes acceso al panel DNS de hablaris.com? ¿Dónde tienes registrado el dominio?
