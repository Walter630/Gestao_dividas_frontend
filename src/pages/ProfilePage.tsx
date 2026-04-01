import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback name if email is the only thing we have
  const userName = user?.email ? user.email.split('@')[0] : 'Usuário';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const fetchPlan = async () => {
    try {
      const response = await api.get('/subscription/my-plan');
      setCurrentPlan(response.data);
    } catch (error) {
      console.error('Erro ao buscar plano no perfil', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return (
    <Layout>
      <Topbar 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações e configurações de conta" 
      />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header Section com Efeito Glass */}
        <div className="relative overflow-hidden rounded-3xl bg-dark-800/40 border border-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-48 h-48 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
             </svg>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-glow animate-pulse-subtle">
              {userInitials}
            </div>
            
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight capitalize">{userName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {user?.role || 'User'}
                </span>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {currentPlan?.planName || (isLoading ? 'Carregando...' : 'Bronze')}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            
            <div className="md:ml-auto">
              <Button variant="secondary" onClick={() => navigate('/assinatura')}>
                Ver Assinatura
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações da Conta */}
          <Card className="p-6 space-y-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Dados da Conta
            </h3>
            
            <div className="space-y-4">
              <div className="group">
                <p className="text-gray-500 text-xs uppercase mb-1">E-mail</p>
                <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Identificador de Acesso</p>
                <p className="text-white font-medium flex items-center gap-2">
                  {user?.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuário Padrão'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Status do Plano</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${currentPlan?.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`} />
                  <p className="text-white">{currentPlan?.active ? 'Ativo e Regular' : 'Aguardando Aprovação'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Segurança e Ações */}
          <Card className="p-6 flex flex-col">
            <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Segurança
            </h3>
            
            <div className="space-y-4 flex-1">
              <p className="text-gray-400 text-sm leading-relaxed">
                Você pode fazer logout da sua conta a qualquer momento. Suas sessões em outros dispositivos permanecerão ativas.
              </p>
            </div>

            <div className="pt-6 border-t border-dark-300/30 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all duration-300 border border-red-500/20 group"
              >
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Encerrar Sessão
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
