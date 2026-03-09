import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glowing, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-dark-600 border border-dark-300/50 rounded-2xl p-5
        ${glowing ? 'shadow-glow' : 'shadow-card'}
        ${onClick ? 'cursor-pointer hover:border-primary-500/50 transition-all duration-200 hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const colorMap = {
  primary: {
    icon: 'bg-primary-500/20 text-primary-400',
    glow: 'hover:shadow-glow',
    border: 'hover:border-primary-500/40',
  },
  success: {
    icon: 'bg-emerald-500/20 text-emerald-400',
    glow: 'hover:shadow-glow-success',
    border: 'hover:border-emerald-500/40',
  },
  warning: {
    icon: 'bg-amber-500/20 text-amber-400',
    glow: '',
    border: 'hover:border-amber-500/40',
  },
  danger: {
    icon: 'bg-red-500/20 text-red-400',
    glow: 'hover:shadow-glow-danger',
    border: 'hover:border-red-500/40',
  },
  info: {
    icon: 'bg-blue-500/20 text-blue-400',
    glow: '',
    border: 'hover:border-blue-500/40',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
}) => {
  const colors = colorMap[color];
  return (
    <div
      className={`bg-dark-600 border border-dark-300/50 rounded-2xl p-5 shadow-card transition-all duration-300 ${colors.glow} ${colors.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.icon}`}>{icon}</div>
        {trend && trendValue && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              trend === 'up'
                ? 'bg-emerald-500/20 text-emerald-400'
                : trend === 'down'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trendValue}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
};

