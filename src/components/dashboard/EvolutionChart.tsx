import React, { useMemo } from 'react';
import { useAllDividas } from '../../db/hooks/useDividas';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { subMonths, startOfMonth, endOfMonth, getMonth } from 'date-fns';
import { formatCurrency } from '../../services/taxCalculator';
import { StatusDivida } from '../../db/types';

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-600 border border-dark-300/50 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="text-sm">
            {p.dataKey === 'dividas' ? 'Dívidas' : 'Pagamentos'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EvolutionChart: React.FC = () => {
  const allDividas = useAllDividas();

  const data = useMemo(() => {
    if (!allDividas) return null;

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date).toISOString();
      const end = endOfMonth(date).toISOString();

      const inMonth = allDividas.filter((d: any) => {
        const created = d.createAt || d.dataVencimento || '';
        return created >= start && created <= end;
      });

      const totalDividas = inMonth.reduce((sum: number, d: any) => sum + (d.valorOriginal || d.valor || 0), 0);
      const totalPago = allDividas
        .filter((d: any) => {
          const paid = d.status === StatusDivida.PAGO;
          const dueInMonth = d.dataVencimento >= start && d.dataVencimento <= end;
          return paid && dueInMonth;
        })
        .reduce((sum: number, d: any) => sum + (d.valorOriginal || d.valor || 0), 0);

      months.push({
        mes: MONTHS_PT[getMonth(date)],
        dividas: totalDividas,
        pagamentos: totalPago,
      });
    }

    return months;
  }, [allDividas]);

  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center animate-pulse rounded-xl bg-dark-500/30">
        <div className="text-gray-600 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <span className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-6 h-0.5 bg-red-400 rounded-full inline-block" />
          Dívidas
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-6 h-0.5 bg-emerald-400 rounded-full inline-block" />
          Pagamentos
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradDividas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPagamentos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />

          <XAxis
            dataKey="mes"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="dividas"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gradDividas)"
            dot={false}
            activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="pagamentos"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradPagamentos)"
            dot={false}
            activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
