import api from './api';
import { Meldung } from '../types/meldung.types';

export interface MieterDashboardData {
  unit: {
    _id: string;
    unitNumber: string;
    property: {
      _id: string;
      name: string;
      address: string;
    };
  };
  meldungen: Meldung[];
}

export interface MieterProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unit?: {
    unitNumber: string;
    floor?: number;
    squareMeters?: number;
    rooms?: number;
    monthlyRent?: number;
    property: {
      name: string;
      address: {
        street: string;
        postalCode: string;
        city: string;
        country?: string;
      };
    };
  };
}

export const mieterService = {
  async getDashboard(): Promise<MieterDashboardData> {
    const response = await api.get<MieterDashboardData>('/mieter/dashboard');
    return response.data;
  },

  async getMeldungen(): Promise<Meldung[]> {
    const response = await api.get<Meldung[]>('/mieter/meldungen');
    return response.data;
  },

  async getMeldung(id: string): Promise<Meldung> {
    const response = await api.get<Meldung>(`/mieter/meldungen/${id}`);
    return response.data;
  },

  async createMeldung(formData: FormData): Promise<Meldung> {
    const response = await api.post<Meldung>('/mieter/meldungen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async sendMessage(meldungId: string, content: string): Promise<void> {
    await api.post(`/mieter/meldungen/${meldungId}/messages`, { content });
  },

  // Neue Profile-Methoden
  async getProfile(): Promise<MieterProfileData> {
    const response = await api.get<MieterProfileData>('/mieter/profile');
    return response.data;
  },

  async updateProfile(profileData: Partial<MieterProfileData>): Promise<MieterProfileData> {
    const response = await api.put<MieterProfileData>('/mieter/profile', profileData);
    return response.data;
  }
};
