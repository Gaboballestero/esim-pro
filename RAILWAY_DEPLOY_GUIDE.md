# Railway eSIM Platform Deployment Guide

## 🚀 Despliegue en Railway

### 1. Preparación del Código ✅
- [x] Procfile configurado
- [x] runtime.txt configurado  
- [x] railway.toml configurado
- [x] Settings.py optimizado para producción
- [x] Requirements.txt actualizado con gunicorn

### 2. Pasos para Deploy

#### A. Crear cuenta Railway
1. Ir a [railway.app](https://railway.app)
2. "Login with GitHub"
3. Autorizar Railway

#### B. Crear nuevo proyecto
1. "New Project" → "Deploy from GitHub repo"
2. Seleccionar tu repositorio `Esim`
3. Railway detectará automáticamente Django

#### C. Configurar variables de entorno
```bash
# Variables de producción necesarias
SECRET_KEY=tu-secret-key-super-seguro-aqui
DEBUG=False
DJANGO_SETTINGS_MODULE=esim_backend.settings

# Variables 1oT (cuando tengas las credenciales)
IOT_API_KEY=tu-1ot-api-key
IOT_API_SECRET=tu-1ot-secret
IOT_BASE_URL=https://api.1ot.com/v1
IOT_TEST_MODE=false

# Variables Twilio (si las mantienes)
TWILIO_ACCOUNT_SID=tu-twilio-sid
TWILIO_AUTH_TOKEN=tu-twilio-token
```

#### D. Agregar PostgreSQL
1. En tu proyecto Railway: "New" → "Database" → "PostgreSQL"
2. Railway conectará automáticamente la variable `DATABASE_URL`

#### E. Deploy automático
1. `git add .`
2. `git commit -m "Configure for Railway deployment"`
3. `git push origin main`
4. Railway desplegará automáticamente

### 3. URLs resultantes
```
Backend API: https://tu-proyecto.railway.app
Health check: https://tu-proyecto.railway.app/health/
API Test: https://tu-proyecto.railway.app/api/1ot/test-credentials/
```

### 4. Frontend por separado (Opcional)
Si quieres desplegar el frontend Next.js por separado:
1. "New Project" → Seleccionar carpeta `frontend/`
2. Railway detectará Next.js automáticamente
3. Configurar variable: `NEXT_PUBLIC_API_URL=https://tu-backend.railway.app`

### 5. Comandos útiles Railway CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link proyecto existente
railway link

# Ver logs en tiempo real
railway logs

# Abrir proyecto en browser
railway open
```

### 6. Monitoreo
- Dashboard Railway: Ver métricas, logs, variables
- Health check automático en `/health/`
- Auto-scaling según tráfico

### 7. Costos estimados
```
Starter: $5/mes (perfecto para desarrollo)
Pro: $20/mes (para producción)
PostgreSQL: Incluida
Custom domain: Gratis
SSL: Automático y gratis
```

## ✅ Estado actual
Todo listo para deploy. Solo necesitas:
1. Hacer commit de estos cambios
2. Push a GitHub
3. Conectar con Railway
4. ¡Listo! 🚀
