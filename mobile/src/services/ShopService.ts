import { Platform } from 'react-native';

export interface ShopPlan {
  id: number;
  name: string;
  country: string;
  flag: string;
  data: string;
  days: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  features: string[];
  category: string;
  popular?: boolean;
}

export interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  planCount: number;
}

export interface FeaturedOffer {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  popular: boolean;
  features: string[];
  planId: number;
}

export interface PopularDestination {
  id: number;
  name: string;
  flag: string;
  planCount: number;
  fromPrice: number;
  countryCode: string;
  trending: boolean;
  trendingScore: number;
  popularityRank: number;
  region: string;
}

export interface CartItem {
  planId: number;
  plan: ShopPlan;
  quantity: number;
}

class ShopService {
  private static instance: ShopService;
  private cart: CartItem[] = [];
  private pendingCartRedirect: boolean = false;
  // simple in-memory cache to avoid extra calls in the same session
  private cachedPlans: ShopPlan[] | null = null;
  private lastFetchTs: number = 0;

  // Prefer emulator-friendly URLs first; all include /api suffix
  private getWebApiUrls(): string[] {
    const urls: string[] = [];
    // Development URLs
    if (__DEV__) {
      if (Platform.OS === 'android') {
        urls.push('http://10.0.2.2:3000/api'); // Android emulator
      }
      urls.push('http://127.0.0.1:3000/api');
      urls.push('http://localhost:3000/api');
    }
    // Optional LAN IP fallback (adjust if needed)
    urls.push('http://172.19.12.69:3000/api');
    return urls;
  }

  private async fetchWebJson(endpoint: string, options?: RequestInit, timeoutMs: number = 3000): Promise<any> {
    const bases = this.getWebApiUrls();
    for (const base of bases) {
      const url = `${base}${endpoint}`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, { ...(options || {}), signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) return await res.json();
      } catch (e) {
        // try next base
        continue;
      }
    }
    throw new Error('No se pudo conectar al servidor de planes');
  }

  private mapPlanToShop(p: any): ShopPlan {
    const idNum = typeof p?.id === 'number' ? p.id : parseInt(String(p?.id ?? '0'), 10);
    const coverage = p?.coverage || p?.categoryId || 'general';
    const discountStr = typeof p?.discount === 'number' ? `${p.discount}%` : p?.discount;
    const isPopular = !!p?.isPopular;
    // Best-effort flag/country mapping
    const country = Array.isArray(p?.regions) && p.regions.length > 0 ? p.regions[0] : (coverage === 'global' ? 'Global' : '');
    const flag = coverage === 'global' ? '🌍' : (country === 'Europa' ? '🇪🇺' : '');
    return {
      id: idNum,
      name: p?.name ?? 'Plan',
      country,
      flag,
      data: p?.data ?? '',
      days: p?.duration ?? 0,
      price: p?.price ?? 0,
      originalPrice: p?.originalPrice,
      discount: discountStr,
      features: Array.isArray(p?.features) ? p.features : [],
      category: coverage,
      popular: isPopular,
    } as ShopPlan;
  }

  private async loadAllPlans(force: boolean = false): Promise<ShopPlan[]> {
    const now = Date.now();
    if (!force && this.cachedPlans && now - this.lastFetchTs < 10000) {
      return this.cachedPlans;
    }
    try {
      const json = await this.fetchWebJson('/plans', { method: 'GET' });
      const list = Array.isArray(json?.data) ? json.data : [];
      const mapped: ShopPlan[] = list.map((p: any) => this.mapPlanToShop(p));
      this.cachedPlans = mapped;
      this.lastFetchTs = now;
      return mapped;
    } catch (_) {
      // fallback: empty -> UI can handle no results or rely on previous mock if needed
      return [];
    }
  }

  static getInstance(): ShopService {
    if (!ShopService.instance) {
      ShopService.instance = new ShopService();
    }
    return ShopService.instance;
  }

  // Obtener categorías
  async getCategories(): Promise<ShopCategory[]> {
    try {
      const plans = await this.loadAllPlans();
      const counts = {
        popular: plans.filter(p => p.popular).length,
        regional: plans.filter(p => p.category === 'regional').length,
        global: plans.filter(p => p.category === 'global').length,
      };
      return [
        { id: 'popular', name: 'Popular', icon: 'flame-outline', planCount: counts.popular },
        { id: 'regional', name: 'Regional', icon: 'earth-outline', planCount: counts.regional },
        { id: 'global', name: 'Global', icon: 'globe-outline', planCount: counts.global },
        { id: 'unlimited', name: 'Ilimitado', icon: 'infinite-outline', planCount: 0 },
        { id: 'business', name: 'Business', icon: 'briefcase-outline', planCount: 0 },
      ];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Obtener ofertas destacadas
  async getFeaturedOffers(): Promise<FeaturedOffer[]> {
    try {
      const plans = await this.loadAllPlans();
      const featured = plans.filter(p => p.popular).slice(0, 3);
      return featured.map((p, idx) => ({
        id: idx + 1,
        title: p.name,
        subtitle: `${p.country || p.category} • ${p.days} días`,
        price: `$${p.price.toFixed(2)}`,
        originalPrice: p.originalPrice ? `$${p.originalPrice.toFixed(2)}` : `$${(p.price * 1.2).toFixed(2)}`,
        discount: p.discount || '',
        image: p.flag || (p.category === 'global' ? '🌍' : '�'),
        popular: !!p.popular,
        features: p.features,
        planId: p.id,
      }));
    } catch (error) {
      console.error('Error fetching featured offers:', error);
      return [];
    }
  }

  // Obtener destinos populares
  async getPopularDestinations(): Promise<PopularDestination[]> {
    try {
      // Mock data - replace with actual API call
      const destinations = [
        { 
          id: 1, 
          name: 'España', 
          flag: '🇪🇸', 
          planCount: 12, 
          fromPrice: 15.99, 
          countryCode: 'ES',
          trending: true,
          trendingScore: 95,
          popularityRank: 1,
          region: 'Europa'
        },
        { 
          id: 2, 
          name: 'Francia', 
          flag: '🇫🇷', 
          planCount: 8, 
          fromPrice: 18.99, 
          countryCode: 'FR',
          trending: true,
          trendingScore: 88,
          popularityRank: 3,
          region: 'Europa'
        },
        { 
          id: 3, 
          name: 'Italia', 
          flag: '🇮🇹', 
          planCount: 10, 
          fromPrice: 16.99, 
          countryCode: 'IT',
          trending: false,
          trendingScore: 82,
          popularityRank: 4,
          region: 'Europa'
        },
        { 
          id: 4, 
          name: 'Reino Unido', 
          flag: '🇬🇧', 
          planCount: 15, 
          fromPrice: 19.99, 
          countryCode: 'GB',
          trending: true,
          trendingScore: 90,
          popularityRank: 2,
          region: 'Europa'
        },
        { 
          id: 5, 
          name: 'Alemania', 
          flag: '🇩🇪', 
          planCount: 11, 
          fromPrice: 17.99, 
          countryCode: 'DE',
          trending: false,
          trendingScore: 78,
          popularityRank: 5,
          region: 'Europa'
        },
        { 
          id: 6, 
          name: 'Estados Unidos', 
          flag: '🇺🇸', 
          planCount: 20, 
          fromPrice: 25.99, 
          countryCode: 'US',
          trending: true,
          trendingScore: 92,
          popularityRank: 2,
          region: 'América'
        },
        { 
          id: 7, 
          name: 'Japón', 
          flag: '🇯🇵', 
          planCount: 14, 
          fromPrice: 28.99, 
          countryCode: 'JP',
          trending: true,
          trendingScore: 85,
          popularityRank: 6,
          region: 'Asia'
        },
        { 
          id: 8, 
          name: 'Australia', 
          flag: '🇦🇺', 
          planCount: 9, 
          fromPrice: 32.99, 
          countryCode: 'AU',
          trending: false,
          trendingScore: 75,
          popularityRank: 7,
          region: 'Oceanía'
        },
        { 
          id: 9, 
          name: 'Tailandia', 
          flag: '🇹🇭', 
          planCount: 7, 
          fromPrice: 22.99, 
          countryCode: 'TH',
          trending: true,
          trendingScore: 89,
          popularityRank: 8,
          region: 'Asia'
        },
        { 
          id: 10, 
          name: 'México', 
          flag: '🇲🇽', 
          planCount: 13, 
          fromPrice: 21.99, 
          countryCode: 'MX',
          trending: true,
          trendingScore: 87,
          popularityRank: 9,
          region: 'América'
        },
      ];

      // Ordenar por tendencia y score
      return destinations.sort((a, b) => {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return b.trendingScore - a.trendingScore;
      });
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      return [];
    }
  }

  // Obtener planes por categoría
  async getPlansByCategory(categoryId: string): Promise<ShopPlan[]> {
    try {
      const plans = await this.loadAllPlans();
      switch (categoryId) {
        case 'popular':
          return plans.filter(p => p.popular);
        case 'regional':
          return plans.filter(p => p.category === 'regional');
        case 'global':
          return plans.filter(p => p.category === 'global');
        case 'unlimited':
        case 'business':
        default:
          return [];
      }
    } catch (error) {
      console.error('Error fetching plans by category:', error);
      return [];
    }
  }

  // Buscar planes
  async searchPlans(query: string): Promise<ShopPlan[]> {
    try {
      const allPlans = await this.loadAllPlans();
      const q = query.toLowerCase();
      return allPlans.filter(plan =>
        plan.name.toLowerCase().includes(q) ||
        (plan.country || '').toLowerCase().includes(q)
      );
    } catch (error) {
      console.error('Error searching plans:', error);
      return [];
    }
  }

  // Gestión del carrito
  addToCart(plan: ShopPlan, quantity: number = 1): void {
    const existingItem = this.cart.find(item => item.planId === plan.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        planId: plan.id,
        plan,
        quantity,
      });
    }
  }

  removeFromCart(planId: number): void {
    this.cart = this.cart.filter(item => item.planId !== planId);
  }

  updateCartItemQuantity(planId: number, quantity: number): void {
    const item = this.cart.find(item => item.planId === planId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(planId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  getCart(): CartItem[] {
    return [...this.cart];
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.plan.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart(): void {
    this.cart = [];
  }

  // Gestión de redirección pendiente al carrito
  setPendingCartRedirect(pending: boolean): void {
    this.pendingCartRedirect = pending;
  }

  getPendingCartRedirect(): boolean {
    return this.pendingCartRedirect || false;
  }

  clearPendingCartRedirect(): void {
    this.pendingCartRedirect = false;
  }

  // Obtener plan por ID
  async getPlanById(planId: number): Promise<ShopPlan | null> {
    try {
      const plans = await this.loadAllPlans();
      return plans.find(p => p.id === planId) || null;
    } catch (error) {
      console.error('Error fetching plan by ID:', error);
      return null;
    }
  }

  // Simular compra
  async purchasePlan(planId: number): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Mock implementation - replace with actual API call
      const plan = await this.getPlanById(planId);
      
      if (!plan) {
        return { success: false, error: 'Plan no encontrado' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return { success: true, orderId };
    } catch (error) {
      console.error('Error purchasing plan:', error);
      return { success: false, error: 'Error en la compra' };
    }
  }
}

export default ShopService.getInstance();
