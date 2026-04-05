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

export const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <Topbar
        title="Dashboard"
        subtitle="Visão geral das suas dívidas"
        actions={
          <div className="flex items-center gap-2">
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
          </div>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">

        {/* Stats — mantém os 6 cards originais */}
        <StatsBar />

        {/* Evolução + Próximos Vencimentos */}
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

        {/* Tabela de Dívidas */}
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

      </div>
    </Layout>
  );
};
