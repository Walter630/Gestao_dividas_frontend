import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantMap = {
  primary:
    'bg-primary-600 hover:bg-primary-500 text-white border border-primary-500/50 shadow-glow hover:shadow-glow',
  secondary:
    'bg-dark-400 hover:bg-dark-300 text-gray-200 border border-dark-300/80',
  danger:
    'bg-red-600 hover:bg-red-500 text-white border border-red-500/50',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50',
  ghost:
    'bg-transparent hover:bg-dark-400 text-gray-300 hover:text-white border border-transparent',
  outline:
    'bg-transparent hover:bg-dark-400 text-primary-400 hover:text-primary-300 border border-primary-500/50 hover:border-primary-400',
};

const sizeMap = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-200 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantMap[variant]}
          ${sizeMap[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          icon && iconPosition === 'left' && icon
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';

