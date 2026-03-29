import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      // Assumindo que o token vem em response.data.token ou similar, 
      // ou diretamente na string. Vou tratar string plana e objeto json
      const data = response.data;
      const accessToken = typeof data === 'string' ? data : data.token;
      
      if (accessToken) {
        setToken(accessToken, data.refreshToken);
        setUser({ username, role: data.role || 'USER' });
        toast.success('Login efetuado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error('Token não recebido pelo servidor');
      }
    } catch (error: any) {
      toast.error('Falha ao fazer login: ' + (error.response?.data?.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-50 relative">
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-surface-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-surface-100"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Voltar para Início</span>
      </Link>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-xl shadow-primary-500/20">
            <svg className="w-8 h-8 text-white -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Acesse sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-surface-400">
          Ou{' '}
          <Link to="/register" className="font-medium text-primary-500 hover:text-primary-400 transition-colors">
            crie uma nova conta gratuitamente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-100 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-surface-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Input
                label="Nome de usuário"
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu username"
              />
            </div>

            <div>
              <Input
                label="Senha"
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
