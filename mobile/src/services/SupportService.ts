import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SupportCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

interface SupportTicket {
  id: number;
  ticket_id: string;
  user: any;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  device_info: string;
  app_version: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: number;
  user: any;
  message: string;
  attachments?: string[];
  created_at: string;
}

interface FAQ {
  id: number;
  category: SupportCategory;
  question: string;
  answer: string;
  tags: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

interface ChatSession {
  id: number;
  session_id: string;
  user: any;
  agent?: any;
  status: 'waiting' | 'active' | 'ended';
  started_at: string;
  ended_at?: string;
}

interface ChatMessage {
  id: number;
  user: any;
  message: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
}

interface ContactInfo {
  whatsapp?: string;
  telegram?: string;
  email: string;
  phone: string;
  hours: string;
  response_time: {
    whatsapp: string;
    telegram: string;
    email: string;
    phone: string;
  };
}

class SupportService {
  private async getHeaders() {
    const token = await AsyncStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Categorías de soporte
  async getCategories(): Promise<SupportCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/categories/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching support categories:', error);
      throw error;
    }
  }

  // Tickets de soporte
  async getTickets(page = 1): Promise<{ results: SupportTicket[], count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/?page=${page}`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener tickets');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async createTicket(ticketData: {
    category_id?: number;
    subject: string;
    description: string;
    priority: string;
    device_info?: string;
    app_version?: string;
  }): Promise<SupportTicket> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(ticketData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async getTicket(ticketId: number): Promise<SupportTicket> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  async addMessageToTicket(ticketId: number, message: string): Promise<SupportMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/add_message/`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding message to ticket:', error);
      throw error;
    }
  }

  async closeTicket(ticketId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/close_ticket/`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al cerrar ticket');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  }

  async getTicketStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets/stats/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw error;
    }
  }

  // FAQs
  async getFAQs(params?: {
    category?: number;
    search?: string;
    featured?: boolean;
    page?: number;
  }): Promise<{ results: FAQ[], count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.featured) queryParams.append('featured', 'true');
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await fetch(`${API_BASE_URL}/support/faq/?${queryParams.toString()}`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener FAQs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }

  async getFAQ(faqId: number): Promise<FAQ> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/faq/${faqId}/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener FAQ');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  }

  async getPopularFAQs(): Promise<FAQ[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/faq/popular/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener FAQs populares');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching popular FAQs:', error);
      throw error;
    }
  }

  // Chat en vivo
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/chat/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener sesiones de chat');
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  }

  async createChatSession(): Promise<ChatSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/chat/`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear sesión de chat');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/chat/${sessionId}/messages/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener mensajes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async sendChatMessage(sessionId: number, message: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/chat/${sessionId}/send_message/`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ message, message_type: 'text' }),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async endChatSession(sessionId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/chat/${sessionId}/end_session/`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al finalizar chat');
      }
    } catch (error) {
      console.error('Error ending chat session:', error);
      throw error;
    }
  }

  // Soporte rápido
  async sendWhatsAppSupport(message: string, priority = 'medium'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/quick/whatsapp/`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          message,
          contact_method: 'whatsapp',
          priority,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al enviar mensaje por WhatsApp');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp support:', error);
      throw error;
    }
  }

  async sendTelegramSupport(message: string, priority = 'medium'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/quick/telegram/`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          message,
          contact_method: 'telegram',
          priority,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al enviar mensaje por Telegram');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending Telegram support:', error);
      throw error;
    }
  }

  async getContactInfo(): Promise<ContactInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/support/quick/contact_info/`, {
        headers: await this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener información de contacto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw error;
    }
  }
}

export default new SupportService();
