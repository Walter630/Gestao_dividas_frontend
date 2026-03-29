import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  
  // Ações
  setToken: (token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,

      setToken: (token, refreshToken) => set((state) => ({ 
        token, 
        ...(refreshToken !== undefined ? { refreshToken } : {}) 
      })),
      
      setUser: (user) => set({ user }),
      
      logout: () => {
        set({ token: null, refreshToken: null, user: null });
        // Limpar storage se for necessário explícito, mas a persistência do zustand
        // cuida disso na próxima gravação (ele gravará nulls)
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
    }
  )
);
