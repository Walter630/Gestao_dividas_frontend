import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { StatsBar } from '../components/dashboard/StatsBar';
import { DebtsByStatusChart } from '../components/dashboard/DebtsByStatusChart';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { UpcomingDueSoon } from '../components/dashboard/UpcomingDueSoon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <Topbar
        title="Dashboard"
        subtitle="Visão geral das suas dívidas"
        actions={
          <Link to="/dividas/nova">
            <Button variant="primary" size="md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Dívida
            </Button>
          </Link>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <StatsBar />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary-500 rounded-full" />
              Dívidas por Status
            </h2>
            <DebtsByStatusChart />
          </Card>

          <Card>
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              Tendência Mensal (6 meses)
            </h2>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 bg-primary-500 rounded-sm" />
                Registradas
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                Pagas
              </span>
            </div>
            <MonthlyTrendChart />
          </Card>
        </div>

        {/* Upcoming Dues */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              Vencendo em breve (7 dias)
            </h2>
            <Link to="/dividas">
              <Button variant="ghost" size="sm" className="text-primary-400">
                Ver todas
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
          <UpcomingDueSoon />
        </Card>
      </div>
    </Layout>
  );
};

