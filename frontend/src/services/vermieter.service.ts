import api from './api';
import { Property, Unit, VermieterDashboardData } from '../types/property';
import { Meldung } from '../types/meldung.types';

export const vermieterService = {
  async getDashboard(): Promise<VermieterDashboardData> {
    const response = await api.get<VermieterDashboardData>('/vermieter/dashboard');
    return response.data;
  },

  async getProperties(): Promise<Property[]> {
    const response = await api.get<Property[]>('/vermieter/properties');
    return response.data;
  },

  async getProperty(id: string): Promise<{ property: Property; units: Unit[] }> {
    const response = await api.get<{ property: Property; units: Unit[] }>(
      `/vermieter/properties/${id}`
    );
    return response.data;
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    try {
      const response = await api.post<Property>('/vermieter/properties', {
        ...data,
        totalUnits: data.totalUnits || 1,
        address: {
          ...data.address,
          country: data.address?.country || 'Deutschland'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  },

  async addUnit(
    propertyId: string,
    data: Partial<Unit>
  ): Promise<Unit> {
    const response = await api.post<Unit>(
      `/vermieter/properties/${propertyId}/units`,
      data
    );
    return response.data;
  },

  async assignMeldung(
    meldungId: string,
    data: { handwerkerId: string; priority?: string }
  ): Promise<Meldung> {
    const response = await api.put<Meldung>(
      `/vermieter/meldungen/${meldungId}/assign`,
      data
    );
    return response.data;
  },

  async getNotifications(): Promise<any[]> {
    const response = await api.get<any[]>('/vermieter/notifications');
    return response.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  },
  async getProfile(): Promise<any> {
    const response = await api.get('/vermieter/profile');
    return response.data;
  },

  async updateProfile(data: any): Promise<any> {
    const response = await api.put('/vermieter/profile', data);
    return response.data;
  },

  createTenant: async (data: {
    propertyId: string;
    unitId: string;
    tenant: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      moveInDate: Date;
    };
  }) => {
    const response = await api.post(
      `/vermieter/properties/${data.propertyId}/units/${data.unitId}/tenant`,
      data.tenant
    );
    return response.data;
  },

  async resetUnit(propertyId: string, unitId: string): Promise<void> {
    await api.post(`/vermieter/properties/${propertyId}/units/${unitId}/reset`);
  },

  async getAvailableUnits(propertyId: string): Promise<Unit[]> {
    const response = await api.get<Unit[]>(`/vermieter/properties/${propertyId}/available-units`);
    return response.data;
  },

  async importCsv(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/vermieter/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getHandwerker(): Promise<any[]> {
    const response = await api.get('/vermieter/handwerker');
    return response.data;
  },

  async createHandwerker(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization: string;
  }): Promise<any> {
    const response = await api.post('/vermieter/handwerker', data);
    return response.data;
  },
};