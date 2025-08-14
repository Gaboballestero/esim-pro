import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración global para las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryIdentifier?: string;
  sound?: boolean | string;
  badge?: number;
  subtitle?: string;
}

export interface ScheduledNotificationData extends NotificationData {
  trigger: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
  };
}

export class HablarisNotificationService {
  private static expoPushToken: string | null = null;
  private static notificationListener: any = null;
  private static responseListener: any = null;

  /**
   * Inicializa el servicio de notificaciones
   */
  static async initialize(): Promise<void> {
    try {
      // Configurar categorías de notificación para iOS
      await this.setupNotificationCategories();
      
      // Registrar para notificaciones push
      const token = await this.registerForPushNotificationsAsync();
      this.expoPushToken = token;
      
      // Configurar listeners
      this.setupListeners();
      
      console.log('🔔 Hablaris Notification Service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Configura las categorías de notificaciones para iOS
   */
  private static async setupNotificationCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('DATA_USAGE', [
        {
          identifier: 'VIEW_DETAILS',
          buttonTitle: 'Ver Detalles',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'BUY_MORE_DATA',
          buttonTitle: 'Comprar Más',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('ESIM_EXPIRY', [
        {
          identifier: 'RENEW_PLAN',
          buttonTitle: 'Renovar',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'REMIND_LATER',
          buttonTitle: 'Recordar Después',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('PROMO_OFFER', [
        {
          identifier: 'VIEW_OFFER',
          buttonTitle: 'Ver Oferta',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'DISMISS',
          buttonTitle: 'Descartar',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }
  }

  /**
   * Registra el dispositivo para notificaciones push
   */
  private static async registerForPushNotificationsAsync(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Hablaris Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
        enableVibrate: true,
      });

      // Canal para alertas de datos
      await Notifications.setNotificationChannelAsync('data_alerts', {
        name: 'Alertas de Datos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
      });

      // Canal para ofertas
      await Notifications.setNotificationChannelAsync('promotions', {
        name: 'Ofertas y Promociones',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('¡No se pudieron obtener permisos para notificaciones push!');
        return null;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Push token:', token);
    } else {
      alert('Debe usar un dispositivo físico para notificaciones push');
    }

    return token;
  }

  /**
   * Configura los listeners de notificaciones
   */
  private static setupListeners(): void {
    // Listener para cuando se recibe una notificación
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    // Listener para cuando el usuario interactúa con una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Maneja las respuestas a notificaciones (cuando el usuario toca botones)
   */
  private static handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { actionIdentifier, notification } = response;

    switch (actionIdentifier) {
      case 'VIEW_DETAILS':
        // Navegar a detalles del eSIM
        console.log('🔍 User wants to view details');
        break;
      case 'BUY_MORE_DATA':
        // Navegar a la tienda
        console.log('💰 User wants to buy more data');
        break;
      case 'RENEW_PLAN':
        // Navegar a renovación
        console.log('🔄 User wants to renew plan');
        break;
      case 'VIEW_OFFER':
        // Navegar a la oferta
        console.log('🎁 User wants to view offer');
        break;
      default:
        // Acción por defecto (abrir la app)
        console.log('📱 Default notification action');
        break;
    }
  }

  /**
   * Envía una notificación inmediata
   */
  static async sendNotification(notificationData: NotificationData): Promise<string | null> {
    try {
      const content: any = {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        sound: notificationData.sound !== false ? 'default' : false,
      };

      // Solo agregar subtitle si está definido
      if (notificationData.subtitle) {
        content.subtitle = notificationData.subtitle;
      }

      // Solo agregar categoryIdentifier si está definido
      if (notificationData.categoryIdentifier) {
        content.categoryIdentifier = notificationData.categoryIdentifier;
      }

      // Solo agregar badge si está definido
      if (notificationData.badge !== undefined) {
        content.badge = notificationData.badge;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // Inmediata
      });

      console.log('📤 Notification sent with ID:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Programa una notificación para más tarde
   */
  static async scheduleNotification(notificationData: ScheduledNotificationData): Promise<string | null> {
    try {
      const content: any = {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        sound: notificationData.sound !== false ? 'default' : false,
      };

      // Solo agregar subtitle si está definido
      if (notificationData.subtitle) {
        content.subtitle = notificationData.subtitle;
      }

      // Solo agregar categoryIdentifier si está definido
      if (notificationData.categoryIdentifier) {
        content.categoryIdentifier = notificationData.categoryIdentifier;
      }

      // Solo agregar badge si está definido
      if (notificationData.badge !== undefined) {
        content.badge = notificationData.badge;
      }

      // Construir el trigger correctamente
      let trigger: any = null;
      if (notificationData.trigger.seconds) {
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: notificationData.trigger.seconds,
          repeats: notificationData.trigger.repeats || false,
        };
      } else if (notificationData.trigger.date) {
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationData.trigger.date,
          repeats: notificationData.trigger.repeats || false,
        };
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });

      console.log('⏰ Scheduled notification with ID:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Envía alerta de datos bajo
   */
  static async sendDataLowAlert(percentageUsed: number, remainingData: string, planName: string): Promise<void> {
    await this.sendNotification({
      title: '⚠️ Datos Limitados',
      body: `Has usado ${percentageUsed}% de tu plan ${planName}. Te quedan ${remainingData}.`,
      categoryIdentifier: 'DATA_USAGE',
      data: {
        type: 'data_usage',
        percentageUsed,
        remainingData,
        planName,
      },
      badge: 1,
    });
  }

  /**
   * Envía alerta de vencimiento de eSIM
   */
  static async sendExpiryAlert(planName: string, daysRemaining: number): Promise<void> {
    await this.sendNotification({
      title: '📅 Plan por Vencer',
      body: `Tu plan ${planName} vence en ${daysRemaining} días. ¿Quieres renovarlo?`,
      categoryIdentifier: 'ESIM_EXPIRY',
      data: {
        type: 'expiry_alert',
        planName,
        daysRemaining,
      },
      badge: 1,
    });
  }

  /**
   * Envía notificación de activación exitosa
   */
  static async sendActivationSuccess(planName: string): Promise<void> {
    await this.sendNotification({
      title: '✅ eSIM Activado',
      body: `Tu plan ${planName} se ha activado correctamente. ¡Ya puedes navegar!`,
      data: {
        type: 'activation_success',
        planName,
      },
      sound: 'default',
    });
  }

  /**
   * Envía notificación de oferta especial
   */
  static async sendPromoOffer(title: string, description: string, discount: string): Promise<void> {
    await this.sendNotification({
      title: `🎁 ${title}`,
      body: `${description} ${discount}% de descuento por tiempo limitado.`,
      categoryIdentifier: 'PROMO_OFFER',
      data: {
        type: 'promo_offer',
        discount,
      },
    });
  }

  /**
   * Programa recordatorio de renovación
   */
  static async scheduleRenewalReminder(planName: string, expiryDate: Date): Promise<void> {
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // 1 día antes

    await this.scheduleNotification({
      title: '🔄 Recordatorio de Renovación',
      body: `Tu plan ${planName} vence mañana. Renuévalo para seguir conectado.`,
      categoryIdentifier: 'ESIM_EXPIRY',
      data: {
        type: 'renewal_reminder',
        planName,
      },
      trigger: {
        date: reminderDate,
      },
    });
  }

  /**
   * Cancela una notificación programada
   */
  static async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('🚫 Cancelled notification:', identifier);
  }

  /**
   * Cancela todas las notificaciones
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🚫 Cancelled all notifications');
  }

  /**
   * Obtiene el badge count actual
   */
  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Establece el badge count
   */
  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Envía notificación de prueba
   */
  static async sendTestNotification(): Promise<void> {
    await this.sendNotification({
      title: '🧪 Notificación de Prueba',
      body: 'Esta es una notificación de prueba de Hablaris.',
      data: {
        type: 'test',
      },
    });
  }

  /**
   * Limpia los listeners al cerrar la app
   */
  static cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Obtiene el token de push actual
   */
  static getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default HablarisNotificationService;
