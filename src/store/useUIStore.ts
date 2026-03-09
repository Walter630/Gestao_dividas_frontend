import { create } from 'zustand';
import type { StatusDivida } from '../db/types';

interface UIFilters {
  search: string;
  status: StatusDivida | 'ALL';
  sortBy: 'createAt' | 'dataVencimento' | 'valor' | 'devedorNome';
  sortOrder: 'asc' | 'desc';
}

interface UIState {
  filters: UIFilters;
  isDeleteModalOpen: boolean;
  deletingId: string | null;
  sidebarOpen: boolean;

  setSearch: (search: string) => void;
  setStatusFilter: (status: StatusDivida | 'ALL') => void;
  setSortBy: (sortBy: UIFilters['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;
  toggleSidebar: () => void;
  resetFilters: () => void;
}

const defaultFilters: UIFilters = {
  search: '',
  status: 'ALL',
  sortBy: 'createAt',
  sortOrder: 'desc',
};

export const useUIStore = create<UIState>((set) => ({
  filters: defaultFilters,
  isDeleteModalOpen: false,
  deletingId: null,
  sidebarOpen: false,

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),

  setStatusFilter: (status) =>
    set((state) => ({ filters: { ...state.filters, status } })),

  setSortBy: (sortBy) =>
    set((state) => ({ filters: { ...state.filters, sortBy } })),

  setSortOrder: (sortOrder) =>
    set((state) => ({ filters: { ...state.filters, sortOrder } })),

  openDeleteModal: (id) =>
    set({ isDeleteModalOpen: true, deletingId: id }),

  closeDeleteModal: () =>
    set({ isDeleteModalOpen: false, deletingId: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  resetFilters: () => set({ filters: defaultFilters }),
}));

