import React, { useEffect, useState } from 'react';
import { StatCard } from '../ui/Card';
import { formatCurrency } from '../../services/taxCalculator';
import { getDividaStats } from '../../db/hooks/useDividas';

export const StatsBar: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    getDividaStats().then(data => {
      if (mounted) setStats(data);
    }).catch(e => {
      console.error('Failed to get stats', e);
      // Em caso de erro 403/401, pode ser necessário fazer login
      if (e.response?.status === 403 || e.response?.status === 401) {
        console.warn('Usuário não autenticado. Faça login para ver as estatísticas.');
      }
      // Define stats vazios para não quebrar a UI
      if (mounted) setStats({
        total: 0, totalValor: 0, totalValorAtual: 0, totalEmprestado: 0,
        jurosAcumulados: 0, jurosPendentes: 0, pendentes: 0, pagas: 0,
        vencidas: 0, canceladas: 0, negociando: 0, valorPendente: 0,
        valorPago: 0, valorVencido: 0,
      });
    });
    return () => { mounted = false; };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-dark-600 border border-dark-300/50 rounded-2xl p-5 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
        title="Total Emprestado"
        value={formatCurrency(stats.totalEmprestado)}
        subtitle="Valor original das dívidas ativas"
        color="primary"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />

      <StatCard
        title="Juros Acumulados"
        value={formatCurrency(stats.jurosAcumulados)}
        subtitle="Total de juros (dívidas + cartão)"
        color="danger"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
      />

      <StatCard
        title="Juros Pendentes"
        value={formatCurrency(stats.jurosPendentes)}
        subtitle={`${stats.pendentes} dívida(s) ativas`}
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
