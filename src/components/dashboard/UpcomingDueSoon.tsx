import React, { useMemo } from 'react';
import { useAllDividas } from '../../db/hooks/useDividas';
import { Link } from 'react-router-dom';
import { StatusDivida } from '../../db/types';
import { formatCurrency, formatDate } from '../../services/taxCalculator';
import { addDays, differenceInDays } from 'date-fns';

export const UpcomingDueSoon: React.FC = () => {
  const allDividas = useAllDividas();

  const dividas = useMemo(() => {
    if (!allDividas) return null;
    const now = new Date();
    const sevenDays = addDays(now, 7).toISOString();
    
    return allDividas
      .filter((d) => (d.status === StatusDivida.PENDENTE || d.status === StatusDivida.NEGOCIANDO) && d.dataVencimento <= sevenDays)
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento))
      .slice(0, 6);
  }, [allDividas]);

  if (!dividas) return null;

  return (
    <div className="space-y-2">
      {dividas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-medium">Tudo em dia!</p>
          <p className="text-gray-600 text-xs mt-1">Nenhuma dívida vencendo nos próximos 7 dias</p>
        </div>
      ) : (
        dividas.map((d) => {
          const daysUntilDue = differenceInDays(new Date(d.dataVencimento), new Date());
          const isOverdue = daysUntilDue < 0;

          return (
            <Link
              key={d.id}
              to={`/dividas/${d.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-500 transition-colors group"
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isOverdue ? 'bg-red-400 animate-pulse' : daysUntilDue <= 1 ? 'bg-amber-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-primary-400 transition-colors">
                  {d.devedorNome || 'Cliente Desconhecido'}
                </p>
                <p className="text-gray-500 text-xs">
                  {isOverdue
                    ? `Venceu há ${Math.abs(daysUntilDue)} dias`
                    : daysUntilDue === 0
                    ? 'Vence hoje'
                    : `Vence em ${daysUntilDue} dia(s)`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-primary-400 text-sm font-semibold">{formatCurrency(d.valorAtual)}</p>
                <p className="text-gray-600 text-xs">{formatDate(d.dataVencimento)}</p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
};
