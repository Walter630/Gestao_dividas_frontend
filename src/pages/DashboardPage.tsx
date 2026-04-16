import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { StatsBar } from '../components/dashboard/StatsBar';
import { EvolutionChart } from '../components/dashboard/EvolutionChart';
import { UpcomingDueSoon } from '../components/dashboard/UpcomingDueSoon';
import { DebtTable } from '../components/dashboard/DebtTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { exportDividasCSV } from '../services/exportService';
import { AnaliseIA } from '../components/dashboard/AnaliseIA';
import { useAllDividas } from '../db/hooks/useDividas';

import { useUIStore } from '../store/useUIStore';

export const DashboardPage: React.FC = () => {
  const dividas = useAllDividas();
  const enabledModules = useUIStore(state => state.enabledModules);

  return (
    <Layout>
      <Topbar
        title="Dashboard"
        subtitle={enabledModules.dividas ? "Visão geral das suas dívidas" : "Visão geral das suas finanças"}
        actions={
          <div className="flex items-center gap-2">
            {enabledModules.dividas && (
              <>
                <Button variant="secondary" size="md" onClick={exportDividasCSV}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003-3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Exportar
                </Button>
                <Link to="/dividas/nova">
                  <Button variant="primary" size="md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Dívida
                  </Button>
                </Link>
              </>
            )}
            {enabledModules.cartoes && !enabledModules.dividas && (
              <Link to="/cartoes/compra/nova">
                <Button variant="primary" size="md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Lançar Compra
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">

        {/* Stats — mantém os 6 cards originais */}
        <StatsBar />

        {/* Inteligência Artificial - Análise de Estratégia */}
        {enabledModules.dividas && dividas !== undefined && <AnaliseIA dividas={dividas} />}

        {/* Evolução + Próximos Vencimentos */}
        {enabledModules.dividas && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Gráfico de Evolução (lado maior) */}
            <Card className="lg:col-span-3">
              <div className="mb-4">
                <h2 className="text-white font-semibold text-sm">Evolução</h2>
                <p className="text-gray-500 text-xs mt-0.5">Dívidas vs. pagamentos nos últimos 6 meses</p>
              </div>
              <EvolutionChart />
            </Card>

            {/* Próximos Vencimentos (lado menor) */}
            <Card className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-white font-semibold text-sm">Próximos Vencimentos</h2>
                <p className="text-gray-500 text-xs mt-0.5">Dívidas com vencimento próximo</p>
              </div>
              <UpcomingDueSoon />
            </Card>
          </div>
        )}

        {/* Tabela de Dívidas */}
        {enabledModules.dividas && (
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold text-sm">Dívidas</h2>
                <p className="text-gray-500 text-xs mt-0.5">Gerenciando todas as suas dívidas</p>
              </div>
              <Link to="/dividas">
                <Button variant="ghost" size="sm" className="text-primary-400">
                  Ver todas
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
            <DebtTable />
          </Card>
        )}

        {/* Link rápido para Cartões se o módulo de dívidas estiver desativado */}
        {!enabledModules.dividas && enabledModules.cartoes && (
          <Card className="bg-gradient-to-br from-primary-600/20 to-primary-900/10 border-primary-500/20 p-8 flex flex-col items-center text-center">
             <div className="p-4 bg-primary-500/20 rounded-full mb-4">
                <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold text-white">Módulo de Cartões Ativo</h2>
             <p className="text-gray-400 mt-2 max-w-sm">Você está usando o Perfil de Gestão Pessoal. Toda a sua gestão de faturas e limites está disponível no menu de Cartões.</p>
             <Link to="/cartoes" className="mt-6">
                <Button variant="primary" size="lg">Ir para Meus Cartões</Button>
             </Link>
          </Card>
        )}

      </div>
    </Layout>
  );
};
