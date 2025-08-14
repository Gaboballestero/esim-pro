import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config/app';

export interface NotificationData {
  type: 'usage_alert' | 'plan_expiring' | 'esim_activated' | 'payment_success';
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  static async initialize(): Promise<string | null> {
    try {
      console.log('🔔 Notification Service initialized (Demo Mode)');
      
      // In demo mode, return a mock token
      const mockToken = 'demo_push_token_' + Date.now();
      await AsyncStorage.setItem('pushToken', mockToken);
      
      return mockToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  static async scheduleUsageAlert(esimId: number, percentage: number): Promise<void> {
    try {
      // Demo: Show alert instead of push notification
      setTimeout(() => {
        Alert.alert(
          '⚠️ Alerta de Uso de Datos',
          `Has usado el ${percentage}% de tu plan de datos`,
          [{ text: 'OK' }]
        );
      }, 1000);
      
      console.log(`📱 Usage alert scheduled: ${percentage}% for eSIM ${esimId}`);
    } catch (error) {
      console.error('Error scheduling usage alert:', error);
    }
  }

  static async scheduleExpirationAlert(esimId: number, daysLeft: number): Promise<void> {
    try {
      setTimeout(() => {
        Alert.alert(
          '⏰ Tu eSIM está por expirar',
          `Tu plan expira en ${daysLeft} días. ¡Renuévalo ahora!`,
          [
            { text: 'Más tarde' },
            { text: 'Renovar', onPress: () => console.log('Navigate to plans') }
          ]
        );
      }, 2000);
      
      console.log(`📅 Expiration alert scheduled: ${daysLeft} days for eSIM ${esimId}`);
    } catch (error) {
      console.error('Error scheduling expiration alert:', error);
    }
  }

  static async notifyESIMActivated(esimId: number, planName: string): Promise<void> {
    try {
      Alert.alert(
        '✅ eSIM Activada',
        `Tu ${planName} está listo para usar`,
        [{ text: 'Genial!' }]
      );
      
      console.log(`✅ eSIM activation notification sent for: ${planName}`);
    } catch (error) {
      console.error('Error sending activation notification:', error);
    }
  }

  static async notifyPaymentSuccess(orderId: number, amount: string): Promise<void> {
    try {
      Alert.alert(
        '💳 Pago Exitoso',
        `Tu pago de ${amount} ha sido procesado exitosamente`,
        [{ text: 'Perfecto!' }]
      );
      
      console.log(`💳 Payment success notification sent for order: ${orderId}`);
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  static async cancelAllESIMNotifications(esimId: number): Promise<void> {
    try {
      console.log(`🚫 Cancelled all notifications for eSIM: ${esimId}`);
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static async setupNotificationListeners() {
    console.log('👂 Notification listeners setup (Demo Mode)');
    
    // In a real implementation, this would setup actual push notification listeners
    // For demo, we just log that it's setup
  }

  static async sendTestNotification(): Promise<void> {
    try {
      Alert.alert(
        '🧪 Prueba de Notificación',
        'Las notificaciones están funcionando correctamente (Demo)',
        [{ text: 'Excelente!' }]
      );
      
      console.log('🧪 Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Automatic usage monitoring
  static async checkUsageAndNotify(esims: any[]): Promise<void> {
    for (const esim of esims) {
      if (esim.status !== 'activated') continue;

      const totalData = esim.data_used_mb + esim.data_remaining_mb;
      const usagePercentage = (esim.data_used_mb / totalData) * 100;

      // Send alerts at 80% and 95% usage
      if (usagePercentage >= 95) {
        await this.scheduleUsageAlert(esim.id, 95);
      } else if (usagePercentage >= 80) {
        await this.scheduleUsageAlert(esim.id, 80);
      }

      // Check expiration (within 3 days)
      const expirationDate = new Date(esim.expires_at);
      const now = new Date();
      const daysLeft = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 3 && daysLeft > 0) {
        await this.scheduleExpirationAlert(esim.id, daysLeft);
      }
    }
  }

  static async enableNotifications(): Promise<boolean> {
    try {
      // In demo mode, always return true
      await AsyncStorage.setItem('notifications_enabled', 'true');
      console.log('🔔 Notifications enabled');
      return true;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }

  static async disableNotifications(): Promise<boolean> {
    try {
      await AsyncStorage.setItem('notifications_enabled', 'false');
      console.log('🔕 Notifications disabled');
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      return false;
    }
  }

  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('notifications_enabled');
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }
}

// Auto-initialize when service is imported
if (APP_CONFIG.FEATURES.PUSH_NOTIFICATIONS) {
  NotificationService.initialize();
  NotificationService.setupNotificationListeners();
}
