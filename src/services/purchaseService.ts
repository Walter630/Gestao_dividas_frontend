import { api } from './api';
import { CompraParcelada, Parcela } from '../db/types';

export const purchaseService = {
  // ==================== COMPRA PARCELADA ====================
  async getAll(): Promise<CompraParcelada[]> {
    const response = await api.get<CompraParcelada[]>('/compraParcel');
    return response.data;
  },

  async getById(id: string): Promise<CompraParcelada> {
    const response = await api.get<CompraParcelada>(`/compraParcel/${id}`);
    return response.data;
  },

  async create(purchase: Omit<CompraParcelada, 'id' | 'createAt'>): Promise<CompraParcelada> {
    const response = await api.post<CompraParcelada>('/compraParcel', purchase);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/compraParcel/${id}`);
  },

  // ==================== PARCELAS ====================
  async getInstallmentsByCard(cardId: string): Promise<Parcela[]> {
    const response = await api.get<Parcela[]>(`/parcel/cartao/${cardId}`);
    return response.data;
  },

  async getInstallmentsByMonth(year: number, month: number): Promise<Parcela[]> {
    const response = await api.get<Parcela[]>(`/parcel/mensal`, {
      params: { year, month }
    });
    return response.data;
  },

  async payInstallment(id: string, data: Partial<Parcela>): Promise<Parcela> {
    // Alinhado com o backend Java (PutMapping("/{id}"))
    const response = await api.put<Parcela>(`/parcel/${id}`, data);
    return response.data;
  }
};
