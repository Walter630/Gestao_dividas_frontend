import React, { useMemo } from 'react';
import { useAllDividas } from '../../db/hooks/useDividas';
import { Link } from 'react-router-dom';
import { StatusDivida } from '../../db/types';
import { formatCurrency, calculateDebtBreakdown } from '../../services/taxCalculator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaymentMode, TaxType } from '../../db/types';

const StatusBadge: React.FC<{ status: StatusDivida }> = ({ status }) => {
  const config: Record<string, { label: string; classes: string }> = {
    PENDENTE:   { label: 'Em dia',   classes: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    ATRASADO:   { label: 'Atrasado', classes: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    PAGO:       { label: 'Quitado',  classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    PARCIAL:    { label: 'Parcial',  classes: 'bg-blue-400/20 text-blue-300 border border-blue-400/30' },
    CANCELADA:  { label: 'Cancelado',classes: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
    NEGOCIANDO: { label: 'Negociando',classes:'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  };
  const s = config[status] || config['PENDENTE'];
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.classes}`}>
      {s.label}
    </span>
  );
};

const ProgressBar: React.FC<{ pct: number; status: StatusDivida }> = ({ pct, status }) => {
  const color =
    status === StatusDivida.PAGO ? 'bg-blue-500' :
    status === StatusDivida.ATRASADO ? 'bg-red-500' :
    'bg-primary-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-dark-400 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-9 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
};

export const DebtTable: React.FC = () => {
  const allDividas = useAllDividas();

  const debts = useMemo(() => {
    if (!allDividas) return null;
    return [...allDividas].sort((a, b) =>
      new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
    );
  }, [allDividas]);

  if (!debts) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-dark-500/40 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">Nenhuma dívida encontrada</p>
        <p className="text-gray-600 text-xs mt-1">Cadastre a primeira dívida para começar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-300/40">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Credor</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Valor Total</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4 min-w-[140px]">Progresso</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Parcela</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Vencimento</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Juros</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-300/20">
          {debts.map((d) => {
            const valorOriginal = d.valor || (d as any).valorOriginal || 0;
            
            // Use the breakdown pre-calculated in useAllDividas if available
            const breakdown = (d as any).breakdown || calculateDebtBreakdown(
              valorOriginal,
              d.paymentMode === PaymentMode.JUROS_MENSAL ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
              d.taxValue || 0,
              d.createAt,
              d.paymentMode || PaymentMode.PARCELADO,
              d.pagamentos || []
            );

            const pct = breakdown.valorAtual + breakdown.totalPago > 0 
              ? (breakdown.totalPago / (breakdown.valorAtual + breakdown.totalPago)) * 100 
              : d.status === StatusDivida.PAGO ? 100 : 0;
            
            const parcAtual = breakdown.totalPago > 0 ? Math.round((breakdown.totalPago / valorOriginal) * (d.numeroParcelas || 1)) : 0;
            const taxLabel = d.taxValue != null ? `${d.taxValue.toFixed(1)}%` : '—';

            let vencimentoLabel = '—';
            try {
              if (d.dataVencimento) {
                vencimentoLabel = format(new Date(d.dataVencimento), 'dd/MM/yyyy', { locale: ptBR });
              }
            } catch {}

            return (
              <tr key={d.id} className="group hover:bg-dark-500/30 transition-colors">
                <td className="py-3.5 pr-4">
                  <div>
                    <Link
                      to={`/dividas/${d.id}`}
                      className="text-white font-medium group-hover:text-primary-400 transition-colors"
                    >
                      {d.devedorNome || (d as any).clienteNome || 'Cliente'}
                    </Link>
                    <p className="text-gray-600 text-xs mt-0.5">{d.descricao || '—'}</p>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-white font-semibold">{formatCurrency(breakdown.valorAtual)}</span>
                  {breakdown.jurosAcumulados > 0 && (
                    <p className="text-[10px] text-red-400">+{formatCurrency(breakdown.jurosAcumulados)} juros</p>
                  )}
                </td>
                <td className="py-3.5 pr-4">
                  <ProgressBar pct={pct} status={d.status} />
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-gray-300 text-sm">
                    {parcAtual}/{d.numeroParcelas || 1}
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-gray-300 text-sm">{vencimentoLabel}</span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-gray-300 text-sm">{taxLabel}</span>
                </td>
                <td className="py-3.5">
                  <StatusBadge status={d.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
