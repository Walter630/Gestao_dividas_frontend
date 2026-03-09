import React from 'react';
import { StatusDivida, STATUS_LABELS } from '../../db/types';

interface StatusBadgeProps {
  status: StatusDivida;
  size?: 'sm' | 'md' | 'lg';
}

const statusBgMap: Record<StatusDivida, string> = {
  [StatusDivida.PENDENTE]: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  [StatusDivida.PAGA]: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  [StatusDivida.VENCIDA]: 'bg-red-500/20 text-red-400 border border-red-500/30',
  [StatusDivida.CANCELADA]: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  [StatusDivida.NEGOCIANDO]: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const statusDotMap: Record<StatusDivida, string> = {
  [StatusDivida.PENDENTE]: 'bg-amber-400',
  [StatusDivida.PAGA]: 'bg-emerald-400',
  [StatusDivida.VENCIDA]: 'bg-red-400 animate-pulse',
  [StatusDivida.CANCELADA]: 'bg-gray-400',
  [StatusDivida.NEGOCIANDO]: 'bg-blue-400',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${statusBgMap[status]} ${sizeMap[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
};


