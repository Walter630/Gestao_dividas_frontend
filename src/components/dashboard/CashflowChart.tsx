import React, { useMemo } from 'react';
import { useAllDividas } from '../../db/hooks/useDividas';
import { StatusDivida } from '../../db/types';
import { formatCurrency } from '../../services/taxCalculator';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CashflowChart: React.FC = () => {
  const dividas = useAllDividas();

  // Create projection for the next 4 months
  const projectionData = useMemo(() => {
    if (!dividas) return [];

    const result = [];
    const now = new Date();

    for (let i = 0; i < 4; i++) {
      const targetMonth = addMonths(now, i);
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);

      const monthLabel = format(targetMonth, 'MMM/yyyy', { locale: ptBR });

      // Sum all receivables for this month (Pending/Overdue)
      const expectedInMonth = dividas
        .filter(d => 
          (d.status === StatusDivida.PENDENTE || d.status === StatusDivida.VENCIDA) &&
          isWithinInterval(new Date(d.dataVencimento), { start, end })
        )
        .reduce((sum, d) => sum + d.valorAtual, 0);

      result.push({
        label: monthLabel,
        value: expectedInMonth
      });
    }

    return result;
  }, [dividas]);

  if (!dividas) {
    return <div className="h-48 flex items-center justify-center animate-pulse bg-dark-500 rounded-lg"></div>;
  }

  const maxValue = Math.max(...projectionData.map(d => d.value), 100);

  return (
    <div className="h-64 flex items-end gap-4 pt-6">
      {projectionData.map((data, index) => {
        const heightPct = Math.max((data.value / maxValue) * 100, 2); // min height 2%
        
        return (
          <div key={index} className="flex-1 flex flex-col justify-end items-center group relative h-full">
            {/* Tooltip */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 border border-dark-400 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              {formatCurrency(data.value)}
            </div>
            
            <div 
              className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm transition-all duration-500 hover:brightness-110 relative overflow-hidden"
              style={{ height: `${heightPct}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
            </div>
            <span className="text-gray-400 text-xs mt-3 text-center capitalize">
              {data.label}
            </span>
            <span className="text-white font-bold text-xs mt-1 text-center truncate w-full px-1">
              {formatCurrency(data.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
