import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { db } from '../../db/db';
import { subMonths, startOfMonth, endOfMonth, getMonth } from 'date-fns';

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
import { formatCurrency } from '../../services/taxCalculator';

export const MonthlyTrendChart: React.FC = () => {
  const data = useLiveQuery(async () => {
    const all = await db.dividas.toArray();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date).toISOString();
      const end = endOfMonth(date).toISOString();

      const monthDebts = all.filter((d) => d.createAt >= start && d.createAt <= end);
      const totalValue = monthDebts.reduce((sum, d) => sum + d.valor, 0);
      const paidValue = monthDebts
        .filter((d) => d.status === 'PAGA')
        .reduce((sum, d) => sum + d.valor, 0);

      months.push({
        month: MONTHS_PT[getMonth(date)],
        total: totalValue,
        pago: paidValue,
        count: monthDebts.length,
      });
    }

    return months;
  }, []);

  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-600 border border-dark-300/50 rounded-xl p-3 shadow-card text-sm">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="text-sm">
              {p.name === 'total' ? 'Registradas' : 'Pagas'}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="total" />
        <Bar dataKey="pago" fill="#10b981" radius={[4, 4, 0, 0]} name="pago" />
      </BarChart>
    </ResponsiveContainer>
  );
};

