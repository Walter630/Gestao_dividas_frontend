import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// URL base do backend (pode ser configurada via .env depois)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Pegamos o estado global diretamente
    const token = useAuthStore.getState().token;

    // As rotas de Auth (/auth/login e /auth/register) não recebem o Bearer token.
    if (token && !config.url?.startsWith('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Enviando Token para ${config.url}`);
    } else {
      console.log(`[API] Requisição sem token para ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
      console.warn(`[AUTH ERROR] Status ${status} em ${error.config?.url}. Verifique se o token expirou ou se o usuário existe no banco.`);
      
      // Se não for uma rota de login, e der 401, podemos sugerir o logout
      if (!error.config?.url?.includes('/auth/')) {
         // useAuthStore.getState().logout(); // Descomente para forçar logout se o erro persistir
      }
    }
    
    return Promise.reject(error);
  }
);
