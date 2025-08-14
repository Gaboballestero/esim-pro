// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://127.0.0.1:8000/api'  // Desarrollo local
  : 'https://api.esimpro.com/api';  // Producción

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  
  // User
  PROFILE: '/auth/profile/',
  
  // Plans
  PLANS: '/plans/',
  
  // eSIMs
  ESIMS: '/esims/',
  
  // Payments
  PAYMENTS: '/payments/',
  
  // Support
  SUPPORT_CATEGORIES: '/support/categories/',
  SUPPORT_TICKETS: '/support/tickets/',
  SUPPORT_FAQ: '/support/faq/',
  SUPPORT_CHAT: '/support/chat/',
  SUPPORT_QUICK: '/support/quick/',
  SUPPORT_KNOWLEDGE_BASE: '/support/knowledge-base/',
};

export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  retries: 3,
  retryDelay: 1000, // 1 segundo
};
