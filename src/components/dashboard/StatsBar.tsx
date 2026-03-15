import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { StatCard } from '../ui/Card';
import { formatCurrency } from '../../services/taxCalculator';
import { getDividaStats } from '../../db/hooks/useDividas';

export const StatsBar: React.FC = () => {
  const stats = useLiveQuery(async () => {
    return getDividaStats();
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-dark-600 border border-dark-300/50 rounded-2xl p-5 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total de Dívidas"
        value={String(stats.total)}
        subtitle={`${stats.pendentes} pendentes`}
        color="primary"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
      />

      <StatCard
        title="Valor Pendente"
        value={formatCurrency(stats.valorPendente)}
        subtitle={`${stats.pendentes} dívida(s)`}
        color="warning"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      <StatCard
        title="Valor Vencido"
        value={formatCurrency(stats.valorVencido)}
        subtitle={`${stats.vencidas} dívida(s)`}
        color="danger"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
      />

      <StatCard
        title="Valor Recebido"
        value={formatCurrency(stats.valorPago)}
        subtitle={`${stats.pagas} quitada(s) + amortizações`}
        color="success"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
};

