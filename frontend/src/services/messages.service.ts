import api from './api';

export const messagesService = {
  async exportConversation(meldungId: string): Promise<Blob> {
    const response = await api.get(`/messages/${meldungId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
