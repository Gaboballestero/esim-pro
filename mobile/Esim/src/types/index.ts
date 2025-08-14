export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface DataPlan {
  id: number;
  name: string;
  description: string;
  dataAmount: string;
  validityDays: number;
  price: number;
  currency: string;
  countries: string[];
  isPopular?: boolean;
}

export interface ESim {
  id: number;
  iccid: string;
  plan: DataPlan;
  status: 'active' | 'inactive' | 'expired';
  activatedAt?: string;
  expiresAt?: string;
  dataUsed?: number;
  qrCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
