import React, { useMemo } from 'react';
import { useAllDividas } from '../../db/hooks/useDividas';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { STATUS_LABELS, STATUS_COLORS, StatusDivida } from '../../db/types';
import { formatCurrency } from '../../services/taxCalculator';

export const DebtsByStatusChart: React.FC = () => {
  const allDividas = useAllDividas();
  
  const data = useMemo(() => {
    if (!allDividas) return null;
    const grouped: Record<string, { count: number; value: number }> = {};

    for (const d of allDividas) {
      if (!grouped[d.status]) grouped[d.status] = { count: 0, value: 0 };
      grouped[d.status].count++;
      grouped[d.status].value += (d.valorAtual || d.valorOriginal || d.valor || 0);
    }

    return Object.entries(grouped).map(([status, { count, value }]) => ({
      name: STATUS_LABELS[status as StatusDivida] || status,
      value: count,
      totalValue: value,
      color: STATUS_COLORS[status as StatusDivida] || '#cbd5e1',
    }));
  }, [allDividas]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-dark-600 border border-dark-300/50 rounded-xl p-3 shadow-card text-sm">
          <p className="text-white font-medium mb-1">{d.name}</p>
          <p className="text-gray-400">{d.value} dívida(s)</p>
          <p className="text-primary-400">{formatCurrency(d.totalValue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-gray-400 text-xs">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
