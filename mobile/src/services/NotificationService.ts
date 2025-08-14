import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'data_low' | 'plan_expiring' | 'roaming_alert' | 'offer' | 'system';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get push token for real device
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your project ID
        });
        this.expoPushToken = token.data;
        
        // Store token locally and send to backend
        await AsyncStorage.setItem('expo_push_token', token.data);
        await this.sendTokenToBackend(token.data);
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
        });

        await Notifications.setNotificationChannelAsync('data-alerts', {
          name: 'Alertas de Datos',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#f59e0b',
        });

        await Notifications.setNotificationChannelAsync('offers', {
          name: 'Ofertas Especiales',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#10b981',
        });
      }

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Replace with your backend endpoint
      const response = await fetch('https://your-backend.com/api/notifications/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          device_info: {
            model: Device.modelName,
            os_version: Device.osVersion,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send token to backend');
      }
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  async scheduleLocalNotification(notification: NotificationData, delaySeconds: number = 0): Promise<string> {
    try {
      const trigger = delaySeconds > 0 
        ? { seconds: delaySeconds }
        : null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            type: notification.type,
            ...notification.data,
          },
          sound: 'default',
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleDataLowAlert(remainingGB: number, planName: string): Promise<void> {
    const notification: NotificationData = {
      type: 'data_low',
      title: '⚠️ Datos Bajos',
      body: `Te quedan ${remainingGB.toFixed(1)}GB en tu plan ${planName}. ¿Quieres recargar?`,
      data: { remaining_gb: remainingGB, plan_name: planName }
    };

    await this.scheduleLocalNotification(notification);
  }

  async schedulePlanExpiryAlert(daysLeft: number, planName: string): Promise<void> {
    const notification: NotificationData = {
      type: 'plan_expiring',
      title: '📅 Plan por Expirar',
      body: `Tu plan ${planName} expira en ${daysLeft} día${daysLeft > 1 ? 's' : ''}. Renueva ahora.`,
      data: { days_left: daysLeft, plan_name: planName }
    };

    // Schedule notification for tomorrow if plan expires in 2+ days
    const delaySeconds = daysLeft > 1 ? (daysLeft - 1) * 24 * 60 * 60 : 0;
    await this.scheduleLocalNotification(notification, delaySeconds);
  }

  async scheduleRoamingAlert(country: string): Promise<void> {
    const notification: NotificationData = {
      type: 'roaming_alert',
      title: '🌍 Roaming Detectado',
      body: `Estás en ${country}. Tu eSIM está activa y funcionando correctamente.`,
      data: { country }
    };

    await this.scheduleLocalNotification(notification);
  }

  async scheduleOfferNotification(offerTitle: string, discount: number): Promise<void> {
    const notification: NotificationData = {
      type: 'offer',
      title: '🎉 Oferta Especial',
      body: `${discount}% de descuento en ${offerTitle}. ¡Solo por tiempo limitado!`,
      data: { offer_title: offerTitle, discount }
    };

    await this.scheduleLocalNotification(notification);
  }

  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotificationsByType(type: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduled) {
      if (notification.content.data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  // Smart notification based on user behavior
  async scheduleSmartNotifications(userStats: any): Promise<void> {
    try {
      // Data usage pattern analysis
      if (userStats.averageDailyUsage && userStats.currentUsage) {
        const projectedUsage = userStats.currentUsage + (userStats.averageDailyUsage * userStats.daysLeft);
        const totalPlan = userStats.totalData;

        // If user will exceed 90% usage, notify
        if (projectedUsage / totalPlan > 0.9) {
          await this.scheduleDataLowAlert(
            totalPlan - userStats.currentUsage, 
            userStats.planName
          );
        }
      }

      // Travel pattern detection
      if (userStats.frequentCountries?.length > 0) {
        // Suggest plans for frequently visited countries
        const suggestion = `¿Planeas viajar pronto? Tenemos ofertas en ${userStats.frequentCountries[0]}`;
        await this.scheduleOfferNotification(suggestion, 20);
      }

      // Renewal reminders based on usage patterns
      if (userStats.daysUntilExpiry <= 3 && userStats.usageRate > 0.5) {
        await this.schedulePlanExpiryAlert(userStats.daysUntilExpiry, userStats.planName);
      }

    } catch (error) {
      console.error('Error scheduling smart notifications:', error);
    }
  }

  // Get notification preferences from user
  async getNotificationPreferences(): Promise<any> {
    try {
      const prefs = await AsyncStorage.getItem('notification_preferences');
      return prefs ? JSON.parse(prefs) : {
        dataAlerts: true,
        expiryAlerts: true,
        roamingAlerts: true,
        offers: true,
        smartSuggestions: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {};
    }
  }

  async updateNotificationPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Handle notification received while app is in foreground
  addNotificationReceivedListener(handler: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(handler);
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener(handler: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService;
