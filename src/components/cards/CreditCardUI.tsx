import React from 'react';
import { CartaoCredito } from '../../db/types';

interface CreditCardUIProps {
  card: CartaoCredito;
  currentInvoice?: number;
  availableLimit?: number;
  onClick?: () => void;
}

export const CreditCardUI: React.FC<CreditCardUIProps> = ({ card, currentInvoice = 0, availableLimit, onClick }) => {
  const limit = card.valorLimite;
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
        relative overflow-hidden rounded-2xl p-5 min-h-[11rem] w-full cursor-pointer
        bg-gradient-to-br ${getCardGradient(card.name)}
        shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-primary-500/20
        flex flex-col justify-between group
      `}
    >
      {/* Chip and Logo decoration */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md flex flex-col items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform">
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
            <div className="w-full h-[1px] bg-black/10 my-0.5" />
            <div className="w-full h-[1px] bg-black/10 my-0.5" />
          </div>
          {/* Bolinhas de Status/Design */}
          <div className="flex gap-1 mt-1.5 ml-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" title="Sistema Ativo" />
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
          </div>
        </div>
        <div className="text-white/30 group-hover:text-white/60 transition-all duration-500 transform group-hover:rotate-12">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="12" r="3" className="fill-white/10" />
          </svg>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-white font-black text-xl tracking-widest uppercase italic drop-shadow-md">{card.name}</h3>
        <p className="text-white/80 text-[10px] font-bold mt-1 bg-white/10 w-fit px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 uppercase">
          Fechamento: Dia {card.diaFechamento}
        </p>
      </div>

      <div className="flex justify-between items-end mt-4">
        <div className="space-y-0.5">
          <p className="text-white/60 text-[9px] uppercase font-black tracking-tighter">Fatura Atual</p>
          <p className="text-white font-black text-2xl drop-shadow-sm">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentInvoice)}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-white/60 text-[9px] uppercase font-black tracking-tighter">Limite Disp.</p>
          <p className="text-emerald-300 font-black text-base drop-shadow-sm">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableLimit ?? limit)}
          </p>
        </div>
      </div>

      {/* Progress bar for limit */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30">
        <div 
          className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.4)] ${percentage > 90 ? 'from-red-500 to-red-700' : ''}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
