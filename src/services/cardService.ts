import { api } from './api';
import { CartaoCredito } from '../db/types';

export const cardService = {
  // GET /cartCredito — lista todos os cartões do usuário logado
  async getAll(): Promise<CartaoCredito[]> {
    const response = await api.get<CartaoCredito[]>('/cartCredito');
    return response.data;
  },

  // GET /cartCredito/{id} — busca um cartão específico
  async getById(id: string): Promise<CartaoCredito> {
    const response = await api.get<CartaoCredito>(`/cartCredito/${id}`);
    return response.data;
  },

  // POST /cartCredito — cria um novo cartão
  async create(card: Omit<CartaoCredito, 'id' | 'createAt'>): Promise<CartaoCredito> {
    const response = await api.post<CartaoCredito>('/cartCredito', card);
    return response.data;
  },

  // DELETE /cartCredito/{id} — remove um cartão
  async delete(id: string): Promise<void> {
    await api.delete(`/cartCredito/${id}`);
  },
};
