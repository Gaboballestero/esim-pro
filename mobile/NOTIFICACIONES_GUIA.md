# 🔔 Sistema de Notificaciones Hablaris

## Descripción General

El sistema de notificaciones de Hablaris implementa notificaciones tipo **Control Center de Apple** usando `expo-notifications`. Está diseñado para ofrecer una experiencia rica y interactiva con:

- ✅ **Notificaciones Push** locales y remotas
- ✅ **Botones interactivos** (iOS)
- ✅ **Canales personalizados** (Android)
- ✅ **Categorías de notificación** para diferentes tipos de alertas
- ✅ **Sonidos y vibraciones** personalizadas
- ✅ **Badge counts** automáticos

## 🚀 Características Implementadas

### 1. **Notificaciones Inmediatas**
```typescript
await HablarisNotificationService.sendNotification({
  title: '✅ eSIM Activado',
  body: 'Tu plan Europa Plus se ha activado correctamente.',
  sound: true,
  badge: 1,
});
```

### 2. **Notificaciones Programadas**
```typescript
await HablarisNotificationService.scheduleNotification({
  title: '📅 Recordatorio',
  body: 'Tu plan vence mañana',
  trigger: {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
  },
});
```

### 3. **Alertas Inteligentes**
- **Datos Limitados**: Alerta cuando queda poco data
- **Vencimiento**: Recordatorio antes de que expire el plan
- **Activación**: Confirmación de activación exitosa
- **Promociones**: Ofertas especiales y descuentos

### 4. **Botones Interactivos (iOS)**
- **Ver Detalles**: Abre la app en la sección específica
- **Comprar Más**: Navega directo a la tienda
- **Renovar**: Acceso rápido a renovación
- **Recordar Después**: Programa recordatorio

## 📱 Tipos de Notificación

### 🚨 **Alertas de Datos**
```typescript
await HablarisNotificationService.sendDataLowAlert(85, '150 MB', 'Europa Plus');
```
- **Trigger**: Cuando se usa 80% o más del plan
- **Botones**: "Ver Detalles" | "Comprar Más"
- **Prioridad**: Alta

### 📅 **Alertas de Vencimiento**
```typescript
await HablarisNotificationService.sendExpiryAlert('Asia Premium', 2);
```
- **Trigger**: 1-3 días antes del vencimiento
- **Botones**: "Renovar" | "Recordar Después"
- **Prioridad**: Alta

### 🎁 **Ofertas Promocionales**
```typescript
await HablarisNotificationService.sendPromoOffer('Black Friday', 'Planes internacionales', '50');
```
- **Trigger**: Eventos especiales o marketing
- **Botones**: "Ver Oferta" | "Descartar"
- **Prioridad**: Media

### ✅ **Confirmaciones**
```typescript
await HablarisNotificationService.sendActivationSuccess('Europa Plus');
```
- **Trigger**: Después de activación exitosa
- **Prioridad**: Normal

## 🛠️ Configuración Técnica

### **app.json - Configuración**
```json
{
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#FF6B35",
    "sounds": ["./assets/notification-sound.wav"],
    "androidMode": "default",
    "androidCollapsedTitle": "Hablaris",
    "iosDisplayInForeground": true
  },
  "android": {
    "useNextNotificationsApi": true
  }
}
```

### **Canales de Android**
- **default**: Notificaciones generales
- **data_alerts**: Alertas de uso de datos
- **promotions**: Ofertas y promociones

### **Categorías de iOS**
- **DATA_USAGE**: Alertas de datos con botones interactivos
- **ESIM_EXPIRY**: Vencimiento con opciones de renovación
- **PROMO_OFFER**: Ofertas con botones de acción

## 🎯 Implementación Práctica

### **1. Inicialización Automática**
```typescript
// En App.tsx - se inicializa automáticamente
await HablarisNotificationService.initialize();
```

### **2. Test de Notificaciones**
- Ve a **Perfil → Test Notificaciones**
- Selecciona el tipo de notificación
- Observa el comportamiento en tu dispositivo

### **3. Integración en Flujos de App**
```typescript
// Ejemplo: Después de una compra exitosa
const handlePurchaseSuccess = async (planName: string) => {
  await HablarisNotificationService.sendActivationSuccess(planName);
  
  // Programar recordatorio de vencimiento
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  await HablarisNotificationService.scheduleRenewalReminder(planName, expiryDate);
};
```

## 📊 Monitoreo y Analytics

### **Badge Management**
```typescript
// Obtener contador actual
const currentBadge = await HablarisNotificationService.getBadgeCount();

// Establecer nuevo contador
await HablarisNotificationService.setBadgeCount(3);

// Limpiar contador
await HablarisNotificationService.setBadgeCount(0);
```

### **Cancelación de Notificaciones**
```typescript
// Cancelar una notificación específica
await HablarisNotificationService.cancelNotification(notificationId);

// Cancelar todas las notificaciones programadas
await HablarisNotificationService.cancelAllNotifications();
```

## 🎨 Personalización Visual

### **Colores de Marca**
- **Primary**: `#FF6B35` (Naranja Hablaris)
- **Background**: `#FFFFFF`
- **Text**: `#333333`

### **Iconos**
- **Datos**: ⚠️ 📊
- **Vencimiento**: 📅 ⏰
- **Éxito**: ✅ 🎉
- **Promoción**: 🎁 💰

### **Sonidos**
- **Alerta**: Sonido sistema por defecto
- **Éxito**: Sonido suave
- **Promoción**: Sonido llamativo

## 🔧 Troubleshooting

### **Permisos**
```typescript
// Verificar permisos
const { status } = await Notifications.getPermissionsAsync();
if (status !== 'granted') {
  await Notifications.requestPermissionsAsync();
}
```

### **Testing en Simulador**
- Las notificaciones push **NO** funcionan en simulador
- Usa un dispositivo físico para testing completo
- Las notificaciones locales SÍ funcionan en simulador

### **Debugging**
```typescript
// Habilitar logs detallados
console.log('🔔 Notification sent:', notificationId);
console.log('📱 Push token:', await HablarisNotificationService.getExpoPushToken());
```

## 📋 Próximas Mejoras

- [ ] **Notificaciones Rich**: Imágenes y multimedia
- [ ] **Geofencing**: Alertas basadas en ubicación
- [ ] **Push Remotas**: Integración con servidor Django
- [ ] **Analytics**: Métricas de interacción
- [ ] **A/B Testing**: Optimización de mensajes
- [ ] **Personalización**: Preferencias por usuario

## 🚀 Casos de Uso Avanzados

### **1. Flujo de Viaje Inteligente**
```typescript
// Al detectar nueva ubicación
await HablarisNotificationService.sendNotification({
  title: '🌍 ¡Bienvenido a París!',
  body: 'Tu eSIM Europa está activo. Revisa tu consumo de datos.',
  data: { location: 'Paris', country: 'France' },
});
```

### **2. Recordatorios Contextuales**
```typescript
// Basado en patrones de uso
if (dataUsage > 0.8 && timeToExpiry < 3) {
  await HablarisNotificationService.sendNotification({
    title: '⚡ Renovación Recomendada',
    body: 'Tu plan vence pronto y has usado mucho data.',
    categoryIdentifier: 'SMART_RENEWAL',
  });
}
```

### **3. Gamificación**
```typescript
// Logros y recompensas
await HablarisNotificationService.sendNotification({
  title: '🏆 ¡Logro Desbloqueado!',
  body: 'Has visitado 5 países con Hablaris. Tienes 20% descuento.',
  data: { achievement: 'world_traveler', discount: 20 },
});
```

---

**¡El sistema de notificaciones Hablaris está listo para ofrecer una experiencia de usuario excepcional! 🎉**
