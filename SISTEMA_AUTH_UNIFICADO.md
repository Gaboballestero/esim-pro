# Sistema de Autenticación Unificado - Hablaris

## 🎯 Objetivo
Crear un sistema de autenticación sincronizado entre la app móvil y el frontend web, donde las credenciales funcionen en ambas plataformas.

## 🔄 Cómo Funciona la Sincronización

### Registro de Usuario

#### En la Web:
1. Usuario se registra en `http://localhost:3000/auth/register`
2. Se guarda en la "base de datos" del servidor (simulada en memoria)
3. Las credenciales quedan disponibles para login web inmediatamente

#### En la App Móvil:
1. Usuario se registra en la app móvil
2. Se guarda localmente en AsyncStorage
3. **Automáticamente** intenta registrar el mismo usuario en la web
4. Si la web está disponible, sincroniza los datos

### Login de Usuario

#### Desde la Web:
1. Usuario hace login en la web
2. Busca en la base de datos web
3. Si encuentra las credenciales, permite el acceso

#### Desde la App Móvil:
1. Usuario hace login en la app móvil
2. **Primero** busca en los datos locales (AsyncStorage)
3. **Si no encuentra** las credenciales localmente:
   - Intenta hacer login en la web
   - Si el login web es exitoso, descarga y guarda los datos localmente
   - Permite el acceso con los datos sincronizados

### Sincronización Bidireccional

#### Al Iniciar la App Móvil:
- Descarga todos los usuarios de la web (sin contraseñas)
- Los combina con usuarios locales sin duplicados
- Envía usuarios locales nuevos a la web

#### Al Registrarse en Cualquier Plataforma:
- Web: Los datos quedan disponibles inmediatamente para móvil
- Móvil: Intenta registrar también en web para sincronización inmediata

## 🧪 Credenciales de Prueba

### Usuarios Predefinidos (Funcionan en ambas plataformas):
- `test@hablaris.com` / `password123`
- `admin@hablaris.com` / `admin123`
- `demo@demo.com` / `demo123`
- `user@test.com` / `123456`

### Flujo de Prueba Recomendado:

#### Prueba 1: Registro Web → Login Móvil
1. Registra un usuario nuevo en `http://localhost:3000/auth/register`
2. Abre la app móvil
3. Intenta hacer login con las mismas credenciales
4. ✅ Debería funcionar (se sincroniza automáticamente)

#### Prueba 2: Registro Móvil → Login Web
1. Registra un usuario nuevo en la app móvil
2. Ve a `http://localhost:3000/auth/login`
3. Intenta hacer login con las mismas credenciales
4. ✅ Debería funcionar (se sincronizó al registrar)

#### Prueba 3: Sin Conexión → Con Conexión
1. Registra usuarios en móvil sin conexión a internet
2. Conecta a internet y abre la app
3. Los usuarios se sincronizan automáticamente con la web

## 🚀 Para Producción (Django)

Cuando conectes con Django, solo necesitas:

1. **Cambiar las URLs** en `MockAuthService.ts`:
   ```typescript
   private readonly WEB_API_URL = 'https://tu-backend-django.com/api/auth';
   ```

2. **Configurar CORS** en Django para permitir requests del móvil

3. **Usar la misma base de datos** PostgreSQL para ambas plataformas

## 📱 URLs de API

### Web (Frontend Next.js):
- **Login**: `POST /api/auth/login`
- **Registro**: `POST /api/auth/register`
- **Sincronización**: `GET /api/auth/register` (obtener usuarios)
- **Sincronización**: `PUT /api/auth/register` (enviar usuarios del móvil)

### Móvil (React Native):
- Usa las mismas APIs del frontend web
- Sincronización automática en background

## ✅ Estado Actual

- ✅ **Registro web funcional**
- ✅ **Login web funcional**
- ✅ **Sincronización web → móvil**
- ✅ **Sincronización móvil → web**
- ✅ **Login cruzado entre plataformas**
- ✅ **Usuarios predefinidos compartidos**

## 🎉 ¡Listo para Usar!

Las credenciales ahora funcionan en ambas plataformas. Si te registras en una, puedes hacer login en la otra automáticamente.
