// Constantes de marca para Hablaris
// Mantiene los nombres internos (archivos, packages) pero cambia la UI

export const BRAND_CONFIG = {
  // Nombre de la app (lo que ve el usuario)
  APP_NAME: 'Hablaris',
  
  // Taglines y descripciones
  TAGLINE: 'Conectividad sin fronteras',
  DESCRIPTION: 'Tu compañero de viaje para conectividad global',
  
  // Textos comunes de UI
  SHOP_TITLE: 'Hablaris Shop',
  WELCOME_TITLE: 'Hablaris',
  LOGIN_TITLE: '¡Bienvenido a Hablaris!',
  REGISTER_TITLE: '¡Únete a Hablaris!',
  
  // Notificaciones y alertas
  NOTIFICATION_PREFIX: 'Hablaris',
  SUPPORT_SUBJECT: 'Soporte Hablaris',
  
  // URLs y contacto (mantenemos internos por ahora)
  SUPPORT_EMAIL: 'soporte@hablaris.com',
  WEBSITE_URL: 'https://hablaris.com',
  
  // Metadata para stores
  STORE_DESCRIPTION: 'Conectividad global instantánea con eSIMs premium. Viaja sin preocupaciones con Hablaris.',
  STORE_KEYWORDS: ['esim', 'travel', 'data', 'roaming', 'connectivity', 'global', 'hablaris'],
};

// Colores específicos de Hablaris (si queremos personalizar más adelante)
export const HABLARIS_COLORS = {
  PRIMARY: '#4F9AFA', // Azul característico
  SECONDARY: '#6C5CE7', // Púrpura
  ACCENT: '#00D4AA', // Verde menta
  
  // Gradientes para la marca
  BRAND_GRADIENT: ['#4F9AFA', '#6C5CE7'],
  SUCCESS_GRADIENT: ['#00D4AA', '#00B894'],
  WARNING_GRADIENT: ['#FDCB6E', '#E17055'],
};

// Mensajes específicos de la marca
export const BRAND_MESSAGES = {
  WELCOME: 'Bienvenido a Hablaris - Tu puerta al mundo',
  SUCCESS_PURCHASE: 'Tu eSIM de Hablaris está listo para usar',
  REFERRAL_MESSAGE: (code: string) => 
    `¡Únete a Hablaris con mi código de referido ${code} y obtén puntos gratis! 🎁`,
  SUPPORT_GREETING: 'Equipo de soporte de Hablaris aquí para ayudarte',
};

export default BRAND_CONFIG;
