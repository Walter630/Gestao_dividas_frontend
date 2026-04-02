import React from 'react';
import { StatusDivida, StatusParcela, STATUS_LABELS, STATUS_PARCELA_LABELS } from '../../db/types';

type AllStatuses = StatusDivida | StatusParcela;

interface StatusBadgeProps {
  status: AllStatuses;
  size?: 'sm' | 'md' | 'lg';
}

const statusBgMap: Record<string, string> = {
  PENDENTE: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  PAGA: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  VENCIDA: 'bg-red-500/20 text-red-400 border border-red-500/30',
  ATRASADA: 'bg-red-500/20 text-red-400 border border-red-500/30',
  CANCELADA: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  NEGOCIANDO: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const statusDotMap: Record<string, string> = {
  PENDENTE: 'bg-amber-400',
  PAGA: 'bg-emerald-400',
  VENCIDA: 'bg-red-400 animate-pulse',
  ATRASADA: 'bg-red-400 animate-pulse',
  CANCELADA: 'bg-gray-400',
  NEGOCIANDO: 'bg-blue-400',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const label = (STATUS_LABELS as any)[status] || (STATUS_PARCELA_LABELS as any)[status] || status;
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${statusBgMap[status] || statusBgMap.PENDENTE} ${sizeMap[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[status] || statusDotMap.PENDENTE}`} />
      {label}
    </span>
  );
};


