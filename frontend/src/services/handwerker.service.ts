import api from './api';
import { Meldung } from '../types/meldung.types';

export interface HandwerkerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface HandwerkerDashboardData {
  assignedMeldungen: Meldung[];
  stats: {
    totalAssigned: number;
    inProgress: number;
    completed: number;
    averageCompletionTime: number; // in days
  };
}

export const handwerkerService = {
  async getDashboard(): Promise<HandwerkerDashboardData> {
    const response = await api.get<HandwerkerDashboardData>('/handwerker/dashboard');
    return response.data;
  },

  async getProfile(): Promise<HandwerkerProfile> {
    const response = await api.get<HandwerkerProfile>('/handwerker/profile');
    return response.data;
  },

  async updateProfile(profile: HandwerkerProfile): Promise<HandwerkerProfile> {
    const response = await api.put<HandwerkerProfile>('/handwerker/profile', profile);
    return response.data;
  },

  async completeMeldung(
    meldungId: string,
    data: { notes?: string; actualCost?: number }
  ): Promise<Meldung> {
    const response = await api.put<Meldung>(
      `/handwerker/meldungen/${meldungId}/complete`,
      data
    );
    return response.data;
  },

  async updateMeldungStatus(
    meldungId: string,
    status: string,
    notes?: string
  ): Promise<Meldung> {
    const response = await api.put<Meldung>(
      `/handwerker/meldungen/${meldungId}/status`,
      { status, notes }
    );
    return response.data;
  },
};