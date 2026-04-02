import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { cardService } from '../../services/cardService';
import { Parcela, CartaoCredito } from '../../db/types';

export const CardSummary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [cardCount, setCardCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const [installments, cards] = await Promise.all([
          purchaseService.getInstallmentsByMonth(now.getFullYear(), now.getMonth() + 1),
          cardService.getAll()
        ]);
        
        setTotal(installments.reduce((sum, p) => sum + p.valor, 0));
        setCardCount(cards.length);
      } catch (error) {
        console.error('Erro no CardSummary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-24 animate-pulse bg-dark-500/50 rounded-xl" />;

  return (
    <div className="flex items-center justify-between p-4 bg-dark-500/30 rounded-2xl border border-dark-300/30 hover:border-primary-500/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Faturas do Mês</p>
          <p className="text-white font-bold text-lg">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-gray-500 text-[10px] uppercase font-bold">{cardCount} Cartões Ativos</p>
        <Link 
          to="/cartoes" 
          className="text-primary-400 text-xs font-semibold hover:text-primary-300 flex items-center gap-1 justify-end mt-1"
        >
          Ver Detalhes
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
