# 🧪 GUÍA DE TESTING - HABLARIS ESIM PLATFORM

## 🚀 FLUJO COMPLETO DE TESTING

### 1️⃣ ACCESO AL DASHBOARD
```
URL: http://localhost:3000/auth/login
- Hacer login (cualquier email/password)
- Será redirigido a: http://localhost:3000/dashboard
```

### 2️⃣ VERIFICAR DASHBOARD
✅ **Elementos a verificar:**
- Header con logo "Hablaris" y colores de marca
- Navegación horizontal: Dashboard, eSIMs, Shop, Profile, Support
- Stats cards con eSIMs activos
- Branding azul/púrpura integrado

### 3️⃣ PROBAR SHOP
```
- Clic en pestaña "🛒 Shop"
- Debería cargar catálogo de planes
- Filtros por país/precio funcionando
- Cards de planes con precios
```

### 4️⃣ SIMULAR COMPRA
✅ **Proceso de checkout:**
- Seleccionar cualquier plan (ej: España 2GB)
- Clic en "Comprar ahora"
- Se abre modal de checkout
- Probar Apple Pay (simulado)
- O llenar formulario de tarjeta
- Clic en "Confirmar pago"

### 5️⃣ VERIFICAR CREACIÓN DE eSIM
✅ **Lo que debería pasar:**
- Modal muestra "Procesando pago..."
- Luego "¡eSIM Lista!" con detalles
- Se cierra automáticamente después de 4 segundos
- Redirección automática a pestaña "📱 eSIMs"

### 6️⃣ COMPROBAR MIS eSIMs
✅ **En la pestaña eSIMs:**
- Lista de eSIMs con la nueva creada
- Botón "📱 Ver código QR"
- Progreso de uso de datos
- Botones de copiar código/actualizar

### 7️⃣ PROBAR CÓDIGO QR
✅ **Modal de QR:**
- Clic en "Ver código QR"
- Se abre modal con código QR
- Código manual visible
- Botón "Copiar código manual"
- Instrucciones de activación

## 🎯 PUNTOS CRÍTICOS DE TESTING

### 🔗 Navegación
- [ ] Tabs cambian correctamente
- [ ] URLs se actualizan
- [ ] No hay errores en consola

### 🛒 Shop → Checkout
- [ ] Modal se abre correctamente
- [ ] Formularios funcionan
- [ ] Apple Pay/Google Pay simulados
- [ ] Validación de campos

### 📱 Creación de eSIM
- [ ] API /api/esim/create responde
- [ ] Datos se muestran en modal de éxito
- [ ] Redirección automática funciona
- [ ] Nueva eSIM aparece en lista

### 🎨 Branding
- [ ] Colores Hablaris aplicados
- [ ] Logo y tagline correctos
- [ ] Gradientes funcionando
- [ ] Responsive design

## 🐛 POSIBLES PROBLEMAS

### ❌ Si el checkout no funciona:
```javascript
// Verificar en consola del navegador:
// F12 → Console
// Buscar errores de API o network
```

### ❌ Si no redirecciona:
```javascript
// Verificar que onRedirectToESims está siendo llamado
// En CheckoutModal.tsx, línea ~75
```

### ❌ Si no aparecen eSIMs:
```javascript
// Verificar MyESims.tsx está cargando
// Mock data debería aparecer automáticamente
```

## ✅ RESULTADO ESPERADO

Al completar el testing deberías ver:

1. **Dashboard profesional** con branding Hablaris
2. **Shop funcional** con filtros y checkout
3. **Proceso de compra** que crea eSIM real
4. **Lista de eSIMs** con códigos QR
5. **Redirección automática** entre pestañas
6. **API respondiendo** correctamente

## 🎉 ¡ÉXITO!

Si todos los puntos funcionan = **PLATAFORMA LISTA PARA PRODUCCIÓN**

---
*Desarrollado para Hablaris eSIM Platform*
*Testing Guide v1.0*
