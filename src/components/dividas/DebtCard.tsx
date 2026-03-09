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
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

  return (
    <div className="bg-dark-600 border border-dark-300/50 rounded-2xl p-5 shadow-card hover:border-dark-300 transition-all duration-200 hover:-translate-y-0.5 group animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate">{divida.devedorNome}</h3>
          <p className="text-gray-500 text-sm truncate">{divida.devedorEmail}</p>
        </div>
        <StatusBadge status={divida.status} size="sm" />
      </div>

      {/* Values */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs mb-0.5">Valor atual</p>
          <p className="text-primary-400 text-xl font-bold">{formatCurrency(divida.valorAtual)}</p>
          {divida.valorAtual !== divida.valor && (
            <p className="text-gray-600 text-xs line-through">{formatCurrency(divida.valor)}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs mb-0.5">Juros</p>
          <p className="text-gray-400 text-xs">{TAX_TYPE_LABELS[divida.taxType]}</p>
          {divida.taxValue > 0 && (
            <p className="text-gray-500 text-xs">{divida.taxValue}%</p>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div
        className={`flex items-center gap-1.5 text-xs mb-4 px-3 py-2 rounded-lg ${
          isOverdue
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : isDueSoon
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-dark-500 text-gray-400 border border-dark-300/30'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {isOverdue
            ? `Venceu há ${Math.abs(daysUntilDue)} dias`
            : isDueSoon
            ? daysUntilDue === 0
              ? 'Vence hoje!'
              : `Vence em ${daysUntilDue} dias`
            : `Vence em ${formatDate(divida.dataVencimento)}`}
        </span>
      </div>

      {/* Desc */}
      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{divida.descricao}</p>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Link to={`/dividas/${divida.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver
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
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

