# 📱 eSIM Pro Mobile App

Aplicación móvil React Native con Expo para la plataforma eSIM Pro.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# En PowerShell (desde directorio mobile):
.\setup-mobile.ps1

# En CMD (desde directorio mobile):
.\setup-mobile.bat
```

### Opción 2: Manual
```bash
# Instalar dependencias
npm install

# Iniciar servidor Expo  
npx expo start
```

## 📱 Cómo Probar la App

### En Dispositivo Móvil (Recomendado)
1. Descarga **Expo Go** en tu teléfono:
   - 📱 **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - 🤖 **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Escanea el código QR que aparece en la terminal
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   # o
   expo start
   ```

4. **Ejecutar en dispositivo:**
   - **Android:** `npm run android` o escanea el QR con Expo Go
   - **iOS:** `npm run ios` o escanea el QR con Expo Go
   - **Web:** `npm run web`

## 📁 Estructura del Proyecto

```
mobile/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── screens/            # Pantallas de la app
│   │   ├── auth/           # Pantallas de autenticación
│   │   ├── HomeScreen.tsx  # Pantalla principal  
│   │   ├── PlansScreen.tsx # Planes de datos
│   │   └── ...
│   ├── services/           # Servicios API
│   ├── types/              # Definiciones TypeScript
│   ├── constants/          # Constantes y tema
│   └── utils/              # Utilidades
├── assets/                 # Imágenes, iconos, fuentes
├── App.tsx                 # Componente principal
├── app.json               # Configuración Expo
└── package.json           # Dependencias
```

## ✨ Características

### 🔐 Autenticación
- Login/Registro de usuarios
- Gestión de tokens JWT
- Pantalla de bienvenida

### 🏠 Dashboard
- Resumen de eSIMs activas
- Estadísticas de uso de datos
- Acciones rápidas
- Actividad reciente

### 🛒 Planes de Datos
- Catálogo de planes por región
- Comparación de precios
- Compra directa

### 📱 Gestión de eSIM
- Lista de eSIMs activas
- Activación por QR
- Monitoreo de uso
- Renovación de planes

### 🎨 UI/UX
- Diseño moderno con gradientes
- Navegación intuitiva por tabs
- Animaciones suaves
- Diseño responsive

## 🔧 Configuración

### Variables de Entorno
Las configuraciones se encuentran en `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:8000/api"
    }
  }
}
```

### Personalización del Tema
Los colores y estilos se definen en `src/constants/theme.ts`:

```typescript
export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  // ...más colores
};
```

## 📱 Navegación

La app utiliza React Navigation v6 con:

- **Stack Navigator:** Para flujo de autenticación
- **Tab Navigator:** Para navegación principal
- **Screen Params:** Para pasar datos entre pantallas

### Flujo de Navegación:
```
Welcome → Login/Register → Main Tabs
                          ├── Home
                          ├── Plans  
                          ├── My eSIMs
                          └── Profile
```

## 🔌 Integración con Backend

La app se conecta al backend Django a través de:

- **Axios:** Cliente HTTP para API calls
- **AsyncStorage:** Almacenamiento local de tokens
- **Interceptores:** Manejo automático de tokens

### Servicios Disponibles:
- `AuthService`: Autenticación y gestión de usuarios
- `PlanService`: Gestión de planes de datos  
- `ESimService`: Operaciones con eSIMs
- `PaymentService`: Procesamiento de pagos

## 🎯 Próximas Funcionalidades

- [ ] Push notifications
- [ ] Modo oscuro
- [ ] Multiidioma
- [ ] Pagos integrados (Stripe)
- [ ] Chat de soporte
- [ ] Biometría para login
- [ ] Geolocalización para planes
- [ ] Compartir planes familiares

## 🐛 Solución de Problemas

### Error: "Metro bundler failed"
```bash
npx expo start --clear
```

### Error: "Module not found"
```bash
rm -rf node_modules
npm install
```

### iOS: Error de certificados
```bash
expo install --fix
```

### Android: Error de build
```bash
expo run:android --clear
```

## 📞 Soporte

Para ayuda con la app móvil:

1. Revisa la documentación de [Expo](https://docs.expo.dev/)
2. Verifica la configuración del backend
3. Chequea que el servidor Django esté ejecutándose

---
**Estado:** ✅ En desarrollo | **Platform:** iOS/Android | **Framework:** React Native + Expo
