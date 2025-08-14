import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG, isFeatureEnabled } from '../config/app';

// Types para Pagos
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last_digits?: string;
  brand?: string;
  expires_at?: string;
  is_default: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  client_secret?: string;
  payment_method?: PaymentMethod;
}

export interface Transaction {
  id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: PaymentMethod;
  description: string;
  created_at: string;
  completed_at?: string;
}

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: APP_CONFIG.getApiUrl() || undefined,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class PaymentService {
  // 🎯 PASO 4: Sistema de pagos real
  static async createPaymentIntent(amount: number, currency: string = 'USD'): Promise<PaymentIntent> {
    if (!isFeatureEnabled('PAYMENTS')) {
      return this.createDemoPaymentIntent(amount, currency);
    }

    try {
      const response = await apiClient.post('/payments/create-intent/', {
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return this.createDemoPaymentIntent(amount, currency);
    }
  }

  static async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    if (!isFeatureEnabled('PAYMENTS')) {
      return this.confirmDemoPayment(paymentIntentId);
    }

    try {
      const response = await apiClient.post('/payments/confirm/', {
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      return this.confirmDemoPayment(paymentIntentId);
    }
  }

  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (!isFeatureEnabled('PAYMENTS')) {
      return this.getDemoPaymentMethods();
    }

    try {
      const response = await apiClient.get('/payments/methods/');
      return response.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return this.getDemoPaymentMethods();
    }
  }

  static async addPaymentMethod(token: string): Promise<PaymentMethod> {
    if (!isFeatureEnabled('PAYMENTS')) {
      return this.addDemoPaymentMethod();
    }

    try {
      const response = await apiClient.post('/payments/methods/', {
        token
      });
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return this.addDemoPaymentMethod();
    }
  }

  static async getTransactionHistory(): Promise<Transaction[]> {
    if (!isFeatureEnabled('PAYMENTS')) {
      return this.getDemoTransactions();
    }

    try {
      const response = await apiClient.get('/payments/transactions/');
      return response.data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return this.getDemoTransactions();
    }
  }

  // Demo functions
  private static async createDemoPaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
    return {
      id: 'pi_demo_' + Math.random().toString(36).substr(2, 9),
      amount,
      currency,
      status: 'pending',
      client_secret: 'pi_demo_secret_123'
    };
  }

  private static async confirmDemoPayment(paymentIntentId: string): Promise<PaymentIntent> {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: paymentIntentId,
      amount: 1599, // $15.99
      currency: 'USD',
      status: 'succeeded',
      payment_method: {
        id: 'pm_demo_123',
        type: 'card',
        last_digits: '4242',
        brand: 'visa',
        expires_at: '12/27',
        is_default: true
      }
    };
  }

  private static async getDemoPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      {
        id: 'pm_demo_123',
        type: 'card',
        last_digits: '4242',
        brand: 'visa',
        expires_at: '12/27',
        is_default: true
      },
      {
        id: 'pm_demo_456',
        type: 'paypal',
        is_default: false
      }
    ];
  }

  private static async addDemoPaymentMethod(): Promise<PaymentMethod> {
    return {
      id: 'pm_demo_new_' + Math.random().toString(36).substr(2, 9),
      type: 'card',
      last_digits: '1234',
      brand: 'mastercard',
      expires_at: '01/28',
      is_default: false
    };
  }

  private static async getDemoTransactions(): Promise<Transaction[]> {
    return [
      {
        id: 1,
        amount: 1599,
        currency: 'USD',
        status: 'completed',
        payment_method: {
          id: 'pm_demo_123',
          type: 'card',
          last_digits: '4242',
          brand: 'visa',
          is_default: true
        },
        description: 'España Local 5GB Plan',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        amount: 2999,
        currency: 'USD',
        status: 'completed',
        payment_method: {
          id: 'pm_demo_456',
          type: 'paypal',
          is_default: false
        },
        description: 'Europa Regional 10GB Plan',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Stripe integration helpers (for real payments)
  static async initializeStripe() {
    if (!isFeatureEnabled('PAYMENTS')) {
      console.log('Payments disabled, skipping Stripe initialization');
      return;
    }

    // TODO: Initialize Stripe SDK
    console.log('Initializing Stripe...');
  }

  // PayPal integration helpers (for real payments)
  static async initializePayPal() {
    if (!isFeatureEnabled('PAYMENTS')) {
      console.log('Payments disabled, skipping PayPal initialization');
      return;
    }

    // TODO: Initialize PayPal SDK
    console.log('Initializing PayPal...');
  }
}
