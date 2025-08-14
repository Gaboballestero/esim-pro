import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PurchasedESIM {
  id: string;
  planName: string;
  planData: string;
  planValidity: string;
  planCountries: string;
  planFlag: string;
  planPrice: number;
  iccid: string;
  status: 'active' | 'expired' | 'inactive';
  dataUsed: number;
  dataTotal: number;
  validUntil: string;
  purchaseDate: string;
}

class ESIMService {
  private static instance: ESIMService;
  private ESIMS_KEY = 'purchased_esims';

  static getInstance(): ESIMService {
    if (!ESIMService.instance) {
      ESIMService.instance = new ESIMService();
    }
    return ESIMService.instance;
  }

  // Generar ICCID aleatorio
  private generateICCID(): string {
    const prefix = '89012601';
    const randomDigits = Math.random().toString().substring(2, 15);
    return prefix + randomDigits.padEnd(12, '0');
  }

  // Calcular fecha de vencimiento
  private calculateExpiryDate(validity: string): string {
    if (!validity) {
      validity = '30 días'; // Valor por defecto
    }
    
    const days = parseInt(validity.replace(/\D/g, '') || '30');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate.toISOString().split('T')[0];
  }

  // Agregar nuevo eSIM después de compra
  async addPurchasedESIM(plan: any): Promise<PurchasedESIM> {
    try {
      // Validar que los campos necesarios existan
      if (!plan) {
        throw new Error('Plan data is required');
      }

      const planName = plan.name || plan.planName || 'Plan Desconocido';
      const planData = plan.data || plan.planData || '1GB';
      const planValidity = plan.validity || plan.planValidity || '30 días';
      const planCountries = plan.countries || plan.planCountries || 'Internacional';
      const planFlag = plan.flag || plan.planFlag || '🌍';
      const planPrice = plan.price || plan.planPrice || 0;

      const newESIM: PurchasedESIM = {
        id: Date.now().toString(),
        planName,
        planData,
        planValidity,
        planCountries,
        planFlag,
        planPrice,
        iccid: this.generateICCID(),
        status: 'active',
        dataUsed: 0,
        dataTotal: parseInt(planData.replace(/\D/g, '') || '1'),
        validUntil: this.calculateExpiryDate(planValidity),
        purchaseDate: new Date().toISOString().split('T')[0],
      };

      const existingESIMs = await this.getPurchasedESIMs();
      const updatedESIMs = [...existingESIMs, newESIM];
      
      await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(updatedESIMs));
      return newESIM;
    } catch (error) {
      console.error('Error adding purchased eSIM:', error);
      throw error;
    }
  }

  // Obtener todos los eSIMs comprados
  async getPurchasedESIMs(): Promise<PurchasedESIM[]> {
    try {
      const esims = await AsyncStorage.getItem(this.ESIMS_KEY);
      return esims ? JSON.parse(esims) : [];
    } catch (error) {
      console.error('Error getting purchased eSIMs:', error);
      return [];
    }
  }

  // Actualizar uso de datos de un eSIM
  async updateESIMDataUsage(esimId: string, dataUsed: number): Promise<void> {
    try {
      const esims = await this.getPurchasedESIMs();
      const updatedESIMs = esims.map(esim => 
        esim.id === esimId ? { ...esim, dataUsed } : esim
      );
      
      await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(updatedESIMs));
    } catch (error) {
      console.error('Error updating eSIM data usage:', error);
    }
  }

  // Eliminar un eSIM
  async removeESIM(esimId: string): Promise<void> {
    try {
      const esims = await this.getPurchasedESIMs();
      const filteredESIMs = esims.filter(esim => esim.id !== esimId);
      
      await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(filteredESIMs));
    } catch (error) {
      console.error('Error removing eSIM:', error);
    }
  }

  // Agregar algunos eSIMs de demo (solo para demostración inicial)
  async addDemoESIMs(): Promise<void> {
    try {
      const existingESIMs = await this.getPurchasedESIMs();
      
      // Solo agregar demos si no hay eSIMs existentes
      if (existingESIMs.length === 0) {
        const demoESIMs: PurchasedESIM[] = [
          {
            id: 'demo1',
            planName: 'Europa Premium',
            planData: '5GB',
            planValidity: '7 días',
            planCountries: '30+ países',
            planFlag: '🇪🇺',
            planPrice: 19,
            iccid: '8901260123456789012',
            status: 'active',
            dataUsed: 2.3,
            dataTotal: 5,
            validUntil: '2025-08-15',
            purchaseDate: '2025-08-01',
          },
          {
            id: 'demo2',
            planName: 'Asia Explorer',
            planData: '10GB',
            planValidity: '15 días',
            planCountries: '15+ países',
            planFlag: '🌏',
            planPrice: 29,
            iccid: '8901260987654321098',
            status: 'active',
            dataUsed: 5.8,
            dataTotal: 10,
            validUntil: '2025-08-20',
            purchaseDate: '2025-07-25',
          },
        ];

        await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(demoESIMs));
      }
    } catch (error) {
      console.error('Error adding demo eSIMs:', error);
    }
  }

  // Eliminar un eSIM específico
  async deleteESIM(esimId: string): Promise<void> {
    try {
      const esims = await this.getPurchasedESIMs();
      const filteredESIMs = esims.filter(esim => esim.id !== esimId);
      await AsyncStorage.setItem(this.ESIMS_KEY, JSON.stringify(filteredESIMs));
    } catch (error) {
      console.error('Error deleting eSIM:', error);
      throw error;
    }
  }

  // Limpiar todos los eSIMs (para testing)
  async clearAllESIMs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ESIMS_KEY);
    } catch (error) {
      console.error('Error clearing eSIMs:', error);
    }
  }
}

export default ESIMService.getInstance();
