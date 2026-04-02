import { api } from './api';
import { CompraParcelada, Parcela } from '../db/types';

export const purchaseService = {
  async getAll(): Promise<CompraParcelada[]> {
    const response = await api.get<CompraParcelada[]>('/compras-parceladas');
    return response.data;
  },

  async getById(id: string): Promise<CompraParcelada> {
    const response = await api.get<CompraParcelada>(`/compras-parceladas/${id}`);
    return response.data;
  },

  async create(purchase: Omit<CompraParcelada, 'id' | 'createAt'>): Promise<CompraParcelada> {
    const response = await api.post<CompraParcelada>('/compras-parceladas', purchase);
    return response.data;
  },

  async getInstallmentsByCard(cardId: string): Promise<Parcela[]> {
    const response = await api.get<Parcela[]>(`/parcelas/cartao/${cardId}`);
    return response.data;
  },

  async getInstallmentsByMonth(year: number, month: number): Promise<Parcela[]> {
    const response = await api.get<Parcela[]>(`/parcelas/mensal`, {
      params: { year, month }
    });
    return response.data;
  },

  async payInstallment(id: string, data: { dataPagamento: string; valorPago: number }): Promise<Parcela> {
    const response = await api.patch<Parcela>(`/parcelas/${id}/pagar`, data);
    return response.data;
  }
};
