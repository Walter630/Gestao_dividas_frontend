import React from 'react';
import { CartaoCredito } from '../../db/types';

interface CreditCardUIProps {
  card: CartaoCredito;
  currentInvoice?: number;
  availableLimit?: number;
  onClick?: () => void;
}

export const CreditCardUI: React.FC<CreditCardUIProps> = ({ card, currentInvoice = 0, availableLimit, onClick }) => {
  const limit = card.limite;
  const used = limit - (availableLimit ?? limit);
  const percentage = (used / limit) * 100;

  // Determine card color based on name or ID (fallback to brand colors)
  const getCardGradient = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('nubank')) return 'from-purple-600 to-purple-900';
    if (n.includes('inter')) return 'from-orange-500 to-orange-700';
    if (n.includes('c6')) return 'from-gray-800 to-black';
    if (n.includes('itaú') || n.includes('itau')) return 'from-blue-600 to-orange-500';
    if (n.includes('santander')) return 'from-red-600 to-red-800';
    return 'from-primary-600 to-primary-900';
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 h-48 w-full cursor-pointer
        bg-gradient-to-br ${getCardGradient(card.nome)}
        shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-primary-500/20
        flex flex-col justify-between group
      `}
    >
      {/* Chip and Logo decoration */}
      <div className="flex justify-between items-start">
        <div className="w-10 h-8 bg-yellow-400/80 rounded-md flex items-center justify-center overflow-hidden">
          <div className="w-full h-[1px] bg-black/20 my-1" />
          <div className="w-full h-[1px] bg-black/20 my-1" />
        </div>
        <div className="text-white/20 group-hover:text-white/40 transition-colors">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold text-lg tracking-wider uppercase">{card.nome}</h3>
        <p className="text-white/70 text-xs mt-1">Dia de Fechamento: {card.diaFechamento}</p>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-white/60 text-[10px] uppercase font-medium">Fatura Atual</p>
          <p className="text-white font-bold text-xl">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentInvoice)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-[10px] uppercase font-medium">Limite Disp.</p>
          <p className="text-white/90 font-semibold text-sm">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableLimit ?? limit)}
          </p>
        </div>
      </div>

      {/* Progress bar for limit */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20">
        <div 
          className="h-full bg-white/40 transition-all duration-1000" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
