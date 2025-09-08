// services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'An error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async updateSettings(settings: any) {
    return this.request<any>('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  async updateApiKeys(apiKeys: any) {
    return this.request<any>('/auth/api-keys', {
      method: 'PUT',
      body: JSON.stringify(apiKeys),
    });
  }

  // Opportunity methods
  async getOpportunities() {
    return this.request<any[]>('/opportunities');
  }

  async scanForOpportunities() {
    return this.request<any>('/opportunities/scan', {
      method: 'POST',
    });
  }

  async updateOpportunityStatus(id: string, status: string) {
    return this.request<any>(`/opportunities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOpportunity(id: string) {
    return this.request<any>(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  // eBay methods
  async searchEbay(keywords: string, limit?: number) {
    const params = new URLSearchParams({ keywords });
    if (limit) params.append('limit', limit.toString());
    
    return this.request<any[]>(`/ebay/search?${params}`);
  }

  async getEbayItem(itemId: string) {
    return this.request<any>(`/ebay/item/${itemId}`);
  }

  // Amazon methods
  async searchAmazon(keywords: string) {
    const params = new URLSearchParams({ keywords });
    return this.request<any[]>(`/amazon/search?${params}`);
  }

  async getAmazonItem(asin: string) {
    return this.request<any>(`/amazon/item/${asin}`);
  }
}

export const apiService = new ApiService();

// Updated arbitrageService.ts
import { apiService } from './apiService';
import type { ArbitrageOpportunity } from '../types';

export const fetchOpportunities = async (): Promise<ArbitrageOpportunity[]> => {
  try {
    const opportunities = await apiService.getOpportunities();
    return opportunities.map(opp => ({
      ...opp,
      id: opp._id || opp.id,
      dateFound: opp.dateFound || opp.createdAt
    }));
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    // Return mock data as fallback
    const { MOCK_OPPORTUNITIES } = await import('../constants');
    return MOCK_OPPORTUNITIES;
  }
};

export const scanForOpportunities = async (): Promise<any> => {
  return await apiService.scanForOpportunities();
};

export const updateOpportunityStatus = async (id: string, status: string): Promise<any> => {
  return await apiService.updateOpportunityStatus(id, status);
};
