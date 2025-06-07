import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class MeldungService {
  async getAssignedMeldungen() {
    const config = {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    };
    return axios.get(`${API_URL}/api/handwerker/auftraege`, config);
  }

  async getMeldungById(id: string) {
    const config = {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    };
    return axios.get(`${API_URL}/api/handwerker/auftraege/${id}`, config);
  }

  async updateMeldungStatus(id: string, status: string, notes?: string) {
    const config = {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    };
    return axios.put(
      `${API_URL}/api/handwerker/auftraege/${id}/status`,
      { status, notes },
      config
    );
  }

  async addNote(id: string, notes: string) {
    const config = {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    };
    return axios.post(
      `${API_URL}/api/handwerker/auftraege/${id}/notes`,
      { notes },
      config
    );
  }

  async uploadImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const config = {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        'Content-Type': 'multipart/form-data'
      }
    };

    return axios.post(
      `${API_URL}/api/handwerker/auftraege/${id}/images`,
      formData,
      config
    );
  }
}

export const meldungService = new MeldungService();
