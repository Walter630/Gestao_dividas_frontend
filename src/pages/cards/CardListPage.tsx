import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { CreditCardUI } from '../../components/cards/CreditCardUI';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { cardService } from '../../services/cardService';
import { purchaseService } from '../../services/purchaseService';
import { CartaoCredito, Parcela } from '../../db/types';

export const CardListPage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInvoices, setTotalInvoices] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCards, fetchedInstallments] = await Promise.all([
          cardService.getAll(),
          purchaseService.getInstallmentsByMonth(new Date().getFullYear(), new Date().getMonth() + 1)
        ]);
        
        setCards(fetchedCards);
        
        // Calcular total das faturas do mês atual
        const total = fetchedInstallments.reduce((sum, p) => sum + p.valor, 0);
        setTotalInvoices(total);
      } catch (error) {
        console.error('Erro ao buscar cartões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Meus Cartões</h1>
            <p className="text-gray-400 mt-1">Gerencie seus cartões de crédito e parcelamentos.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/cartoes/compra/nova')}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
            >
              Lançar Compra
            </Button>
            <Button 
              onClick={() => navigate('/cartoes/novo')}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
            >
              Novo Cartão
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total em Faturas (Mês)"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoices)}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="primary"
          />
          <StatCard 
            title="Cartões Ativos"
            value={cards.length.toString()}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            color="info"
          />
          <StatCard 
            title="Próximo Vencimento"
            value="--"
            subtitle="Em breve..."
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            color="warning"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-dark-600 rounded-2xl animate-pulse border border-dark-300/30" />
            ))
          ) : cards.length > 0 ? (
            cards.map((card) => (
              <CreditCardUI 
                key={card.id} 
                card={card} 
                onClick={() => navigate(`/cartoes/${card.id}`)}
              />
            ))
          ) : (
            <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-dark-300/40">
              <div className="w-16 h-16 bg-dark-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Nenhum cartão cadastrado</h3>
              <p className="text-gray-400 mt-2 max-w-xs">Comece adicionando seu primeiro cartão de crédito para gerenciar seus gastos.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => navigate('/cartoes/novo')}
              >
                Cadastrar Cartão
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
