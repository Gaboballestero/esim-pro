# Configuración de Autenticación Social - eSIM Pro

## Configuración del Backend (Django)

### 1. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt

# O instalar manualmente:
pip install google-auth google-auth-oauthlib PyJWT cryptography requests
```

### 2. Configurar Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar la API de Google+ y Google Identity
4. Crear credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - URLs autorizadas: `http://localhost:3000`, `https://yourdomain.com`
   - Descargar el JSON de configuración

5. Actualizar `oauth_config.py`:
```python
GOOGLE_OAUTH2_CLIENT_ID = 'tu-client-id.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET = 'tu-client-secret'
```

### 3. Configurar Apple Sign In

1. Ir a [Apple Developer Console](https://developer.apple.com/)
2. Crear un App ID con Sign In with Apple habilitado
3. Crear un Service ID para web authentication
4. Generar una clave privada (.p8 file)
5. Configurar dominios y URLs de retorno

6. Actualizar `oauth_config.py`:
```python
APPLE_CLIENT_ID = 'com.tuapp.bundleid'
APPLE_TEAM_ID = 'tu-team-id'
APPLE_KEY_ID = 'tu-key-id'
```

### 4. Configurar Settings.py

```python
# settings.py

# Agregar a INSTALLED_APPS
INSTALLED_APPS = [
    # ... otras apps
    'rest_framework_simplejwt',
]

# Configuración JWT
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# Configuración OAuth
from .users.oauth_config import *
```

## Configuración del Frontend Mobile (React Native)

### 1. Instalar Dependencias

```bash
cd mobile
npm install @react-native-google-signin/google-signin
npm install @invertase/react-native-apple-authentication
```

### 2. Configuración iOS

1. Agregar a `ios/Podfile`:
```ruby
pod 'GoogleSignIn'
pod 'RNAppleAuthentication', :path => '../node_modules/@invertase/react-native-apple-authentication'
```

2. Configurar `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>GoogleSignIn</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>tu-reversed-client-id</string>
        </array>
    </dict>
</array>
```

### 3. Configuración Android

1. Descargar `google-services.json` de Firebase Console
2. Colocar en `android/app/google-services.json`
3. Configurar `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## Uso en el Frontend

### Implementar Google Sign In

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configurar
GoogleSignin.configure({
  webClientId: 'tu-web-client-id.apps.googleusercontent.com',
  iosClientId: 'tu-ios-client-id.apps.googleusercontent.com',
});

// Iniciar sesión
const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Enviar id_token al backend
    const response = await fetch('/api/users/auth/google/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: userInfo.idToken,
      }),
    });
    
    const data = await response.json();
    // Guardar tokens y manejar usuario
  } catch (error) {
    console.error('Error Google Sign In:', error);
  }
};
```

### Implementar Apple Sign In

```typescript
import { appleAuth } from '@invertase/react-native-apple-authentication';

const signInWithApple = async () => {
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Enviar al backend
    const response = await fetch('/api/users/auth/apple/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: appleAuthRequestResponse.identityToken,
        user_info: appleAuthRequestResponse.fullName ? {
          name: appleAuthRequestResponse.fullName
        } : undefined,
      }),
    });
    
    const data = await response.json();
    // Guardar tokens y manejar usuario
  } catch (error) {
    console.error('Error Apple Sign In:', error);
  }
};
```

## Endpoints de API

### POST /api/users/auth/google/
```json
{
  "id_token": "google_id_token_here"
}
```

### POST /api/users/auth/apple/
```json
{
  "id_token": "apple_id_token_here",
  "user_info": {
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Respuesta exitosa:
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "user",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "https://...",
      "is_email_verified": true
    },
    "tokens": {
      "access": "jwt_access_token",
      "refresh": "jwt_refresh_token"
    }
  }
}
```

## Seguridad

1. **Verificación de tokens**: Los tokens siempre se verifican con los servidores de Google/Apple
2. **HTTPS obligatorio**: Usar HTTPS en producción
3. **Validación de audiencia**: Verificar que los tokens son para tu aplicación
4. **Rate limiting**: Implementar límites de velocidad en los endpoints
5. **Logs de seguridad**: Registrar intentos de autenticación

## Testing

Usar las herramientas de desarrollo de Google y Apple para probar la integración:
- Google OAuth Playground
- Apple's Sign In with Apple JS
- Postman para probar endpoints del backend
