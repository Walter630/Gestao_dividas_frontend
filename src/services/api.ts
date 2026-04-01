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
    // Em caso de erro 401 (Não Autorizado), podemos tentar dar refresh no token
    const originalRequest = error.config;

    // Evita loop infinito caso o erro 401 venha da própria rota de refresh ou login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.startsWith('/auth/')) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refreshToken`, refreshToken, {
            headers: {
              'Content-Type': 'text/plain', // Como dito, "refreshToken (texto puro)"
            }
          });

          const newToken = response.data; // Ou a forma correta que o backend retornar
          // Atualiza o Zustand com o novo token
          useAuthStore.getState().setToken(newToken);

          // Refaz a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Se falhar o refresh, desloga o usuário
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Se não tem refresh token, apenas limpa e sai
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
