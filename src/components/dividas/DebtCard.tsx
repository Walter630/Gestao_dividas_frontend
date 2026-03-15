import React from 'react';
import { Link } from 'react-router-dom';
import type { Divida } from '../../db/types';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../services/taxCalculator';
import { TAX_TYPE_LABELS } from '../../db/types';
import { differenceInDays } from 'date-fns';

interface DebtCardProps {
  divida: Divida;
  onDelete: (id: string) => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({ divida, onDelete }) => {
  const daysUntilDue = differenceInDays(new Date(divida.dataVencimento), new Date());
  const isOverdue = daysUntilDue < 0 && divida.status !== 'PAGA' && divida.status !== 'CANCELADA';
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3 && divida.status !== 'PAGA' && divida.status !== 'CANCELADA';
  const totalPagamentos = divida.pagamentos?.reduce((acc, p) => acc + p.valor, 0) || 0;

  return (
    <div className="relative bg-dark-600 border border-dark-300/50 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 group animate-fade-in overflow-hidden flex flex-col justify-between">
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-white font-bold text-lg truncate group-hover:text-primary-400 transition-colors">{divida.devedorNome}</h3>
            {divida.devedorEmail && <p className="text-gray-500 text-xs truncate mt-0.5">{divida.devedorEmail}</p>}
          </div>
          <StatusBadge status={divida.status} size="sm" />
        </div>

        {/* Values Section */}
        <div className="bg-dark-500/50 rounded-xl p-3 mb-4 relative z-10 border border-dark-300/30">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Saldo Atual</p>
              <p className="text-primary-400 text-2xl font-black tracking-tight">{formatCurrency(divida.valorAtual)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Juros</p>
              <p className="text-white text-xs font-medium bg-dark-400 px-2 py-1 rounded-md">
                {TAX_TYPE_LABELS[divida.taxType]} {divida.taxValue > 0 && <span className="text-primary-400 font-bold ml-1">{divida.taxValue}%</span>}
              </p>
            </div>
          </div>
          
          {/* Progress / Amortization Indicator */}
          {totalPagamentos > 0 && (
            <div className="mt-3 pt-3 border-t border-dark-400/50 flex justify-between items-center">
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Amortizado
              </span>
              <span className="text-emerald-400 font-bold text-sm tracking-tight">{formatCurrency(totalPagamentos)}</span>
            </div>
          )}
        </div>

        {/* Due Date & Description */}
        <div className="space-y-3 relative z-10">
          <div
            className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl font-medium transition-colors ${
              isOverdue
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : isDueSoon
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-dark-500/80 text-gray-400 border border-dark-300/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {isOverdue
                ? `Vencida há ${Math.abs(daysUntilDue)} dia(s)`
                : isDueSoon
                ? daysUntilDue === 0
                  ? 'Vence hoje!'
                  : `Vence em ${daysUntilDue} dia(s)`
                : `Vence em ${formatDate(divida.dataVencimento)}`}
            </span>
          </div>

          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed h-8">{divida.descricao}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-5 relative z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
        <Link to={`/dividas/${divida.id}`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full shadow-lg shadow-primary-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Detalhes
          </Button>
        </Link>
        <Link to={`/dividas/${divida.id}/editar`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(divida.id!)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

