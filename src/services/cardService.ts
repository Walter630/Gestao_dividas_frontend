import { api } from './api';
import { CartaoCredito } from '../db/types';

export const cardService = {
  async getAll(): Promise<CartaoCredito[]> {
    const response = await api.get<CartaoCredito[]>('/cartoes');
    return response.data;
  },

  async getById(id: string): Promise<CartaoCredito> {
    const response = await api.get<CartaoCredito>(`/cartoes/${id}`);
    return response.data;
  },

  async create(card: Omit<CartaoCredito, 'id' | 'createAt'>): Promise<CartaoCredito> {
    const response = await api.post<CartaoCredito>('/cartoes', card);
    return response.data;
  },

  async update(id: string, card: Partial<CartaoCredito>): Promise<CartaoCredito> {
    const response = await api.put<CartaoCredito>(`/cartoes/${id}`, card);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/cartoes/${id}`);
  }
};
