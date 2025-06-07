import api from './api';

export const subscriptionService = {
  async create(plan: string): Promise<{ approvalUrl: string }> {
    const response = await api.post('/subscription/create', { plan });
    return response.data;
  }
};

