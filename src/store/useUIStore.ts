import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  // Módulos Ativos
  enabledModules: {
    cartoes: boolean;
    dividas: boolean;
  };

  setSearch: (search: string) => void;
  setStatusFilter: (status: StatusDivida | 'ALL') => void;
  setSortBy: (sortBy: UIFilters['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;
  toggleSidebar: () => void;
  toggleModule: (module: 'cartoes' | 'dividas') => void;
  resetFilters: () => void;
}

const defaultFilters: UIFilters = {
  search: '',
  status: 'ALL',
  sortBy: 'createAt',
  sortOrder: 'desc',
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      isDeleteModalOpen: false,
      deletingId: null,
      sidebarOpen: false,
      enabledModules: {
        cartoes: true,
        dividas: true,
      },

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

      toggleModule: (module) =>
        set((state) => ({
          enabledModules: {
            ...state.enabledModules,
            [module]: !state.enabledModules[module],
          },
        })),

      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'ui-settings-storage',
    }
  )
);

