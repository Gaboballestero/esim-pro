// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  QRScanner: undefined;
  Checkout: { plan: any };
  Support: undefined;
  Rewards: undefined;
  Geolocation: undefined;
  FlexiblePlans: undefined;
  AdvancedDashboard: undefined;
  Shop: undefined;
  Plans: undefined;
  CoverageMap: undefined;
  DataUsage: undefined;
  PlanManagement: undefined;
  AIAssistant: undefined;
  NotificationSettings: undefined;
  AccountSettings: undefined;
  LiveChat: { 
    esimContext?: {
      iccid: string;
      planName: string;
      status: string;
      dataUsed: number;
      dataTotal: number;
      validUntil: string;
      purchaseDate: string;
      planCountries: string;
    };
    preloadMessage?: string;
  };
  ESIMDetails: { esim: any };
  ESIMGuide: { esim?: any };
  QRCodeView: { esim: any };
};

export type MainTabParamList = {
  Home: undefined;
  Shop: undefined;
  MyESIMs: undefined;
  Profile: undefined;
  Dashboard: undefined;
};

// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  country: string;
  preferred_language: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// eSIM types
export interface ESim {
  id: number;
  iccid: string;
  status: 'inactive' | 'active' | 'suspended' | 'expired';
  data_plan: DataPlan;
  activation_date?: string;
  expiry_date?: string;
  data_used: number;
  qr_code: string;
  created_at: string;
}

// Data Plan types
export interface DataPlan {
  id: number;
  name: string;
  description: string;
  data_amount: number; // in MB
  validity_days: number;
  price: number;
  currency: string;
  countries: Country[];
  is_active: boolean;
  features: string[];
}

// Country types
export interface Country {
  id: number;
  name: string;
  code: string;
  continent: string;
  flag_emoji: string;
}

// Payment types
export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  stripe_payment_intent_id?: string;
  created_at: string;
}

// Order types
export interface Order {
  id: number;
  user: number;
  data_plan: DataPlan;
  payment: Payment;
  esim?: ESim;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}
