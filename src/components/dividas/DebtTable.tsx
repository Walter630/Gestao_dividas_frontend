import React from 'react';
import { Link } from 'react-router-dom';
import type { Divida } from '../../db/types';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../services/taxCalculator';
import { differenceInDays } from 'date-fns';

interface DebtTableProps {
  dividas: Divida[];
  onDelete: (id: string) => void;
}

export const DebtTable: React.FC<DebtTableProps> = ({ dividas, onDelete }) => {
  if (dividas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-dark-500 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-gray-400 font-medium mb-1">Nenhuma dívida encontrada</h3>
        <p className="text-gray-600 text-sm">Ajuste os filtros ou cadastre uma nova dívida</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-dark-300/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dark-600 border-b border-dark-300/30">
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Devedor</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Valor Original</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Valor Atual</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Vencimento</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-300/20">
          {dividas.map((d) => {
            const daysUntilDue = differenceInDays(new Date(d.dataVencimento), new Date());
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

            return (
              <tr
                key={d.id}
                className="bg-dark-700 hover:bg-dark-600 transition-colors duration-150 group"
              >
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{d.devedorNome}</p>
                  <p className="text-gray-500 text-xs">{d.devedorEmail}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{formatCurrency(d.valor)}</td>
                <td className="px-4 py-3">
                  <span className="text-primary-400 font-semibold">{formatCurrency(d.valorAtual)}</span>
                  {d.valorAtual !== d.valor && (
                    <span className="text-red-400 text-xs ml-2">
                      +{formatCurrency(d.valorAtual - d.valor)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-gray-400'
                    }`}
                  >
                    {formatDate(d.dataVencimento)}
                    {isOverdue && ` (${Math.abs(daysUntilDue)}d atrás)`}
                    {isDueSoon && !isOverdue && ` (${daysUntilDue}d)`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/dividas/${d.id}`}>
                      <Button variant="ghost" size="sm" title="Ver detalhes">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                    </Link>
                    <Link to={`/dividas/${d.id}/editar`}>
                      <Button variant="ghost" size="sm" title="Editar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(d.id!)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

