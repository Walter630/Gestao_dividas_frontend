import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { CreditCardUI } from '../../components/cards/CreditCardUI';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { cardService } from '../../services/cardService';
import { purchaseService } from '../../services/purchaseService';
import { CartaoCredito, Parcela, StatusParcela } from '../../db/types';
import { parseJavaDate } from '../../utils/dateUtils';
import { calcularParcelas } from '../../utils/installmentUtils';

export const CardListPage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [installments, setInstallments] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);

  // Mês e Ano atuais para o Dashboard
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCards, fetchedInstallments, fetchedPurchases] = await Promise.all([
          cardService.getAll(),
          purchaseService.getInstallmentsByMonth(currentYear, currentMonth),
          purchaseService.getAll()
        ]);
        
        setCards(fetchedCards);
        setInstallments(fetchedInstallments);
        setAllPurchases(fetchedPurchases);
      } catch (error) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentYear]);

  // Função mestre para consolidar faturas (reais + virtuais)
  const getConsolidatedDataForCard = (card: CartaoCredito) => {
    const id = card.id;
    // 1. Filtra as compras deste cartão
    const cardPurchases = allPurchases.filter(p => 
      p.cartaoCredito?.id === id || p.cartaoId === id || p.tbCartaoCreditoId === id
    );

    // 2. Tenta pegar parcelas reais (que já foram buscadas por mês)
    const realInstallments = installments.filter(p => p.cartaoId === id);
    
    // 3. Se não houver parcelas reais, mas houver compras, gera virtuais para o mês atual
    let cardMonthlyInvoice = 0;
    let cardTotalPending = 0;

    const allVirtualInstallments: Parcela[] = [];
    cardPurchases.forEach(compra => {
      const calculated = calcularParcelas(
        compra.valorTotal,
        compra.quantidadeParcelas,
        compra.dataCompra,
        card.diaFechamento,
        card.diaVencimento
      );
      
      calculated.forEach(p => {
        // Soma pendentes totais (para o limite)
        if (p.status === StatusParcela.PENDENTE) {
          cardTotalPending += p.valor;
        }

        // Soma fatura do mês atual
        const dateStr = parseJavaDate(p.dataVencimento);
        if (dateStr) {
          const d = new Date(dateStr + 'T12:00:00');
          if ((d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear) {
            cardMonthlyInvoice += p.valor;
          }
        }
      });
    });

    // Se tiver parcelas reais, elas prevalecem (mas para o limite usamos a soma do que calculamos se o banco for incoerente)
    const invoice = realInstallments.length > 0 
      ? realInstallments.reduce((s, p) => s + (p.valor || 0), 0)
      : cardMonthlyInvoice;

    const availableLimit = card.valorLimite - cardTotalPending;

    return { invoice, availableLimit };
  };

  // Calcula o total global das faturas do mês atual
  const globalTotalInvoices = useMemo(() => {
    return cards.reduce((sum, card) => sum + getConsolidatedDataForCard(card).invoice, 0);
  }, [cards, allPurchases, installments]);

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
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalTotalInvoices)}
            icon={<svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="primary"
          />
          <StatCard 
            title="Cartões Ativos"
            value={cards.length.toString()}
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            color="info"
          />
          <StatCard 
            title="Limite Geral"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cards.reduce((s, c) => s + (c.valorLimite || 0), 0))}
            icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
            color="success"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-dark-600 rounded-2xl animate-pulse border border-dark-300/30" />
            ))
          ) : cards.length > 0 ? (
            cards.map((card) => {
              const { invoice, availableLimit } = getConsolidatedDataForCard(card);
              return (
                <CreditCardUI 
                  key={card.id || card.name} 
                  card={card} 
                  currentInvoice={invoice}
                  availableLimit={availableLimit}
                  onClick={() => navigate(`/cartoes/${card.id}`)}
                />
              );
            })
          ) : (
            <Card className="col-span-full py-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-dark-300/40 opacity-70">
              <div className="w-20 h-20 bg-dark-400 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Pronto para começar?</h3>
              <p className="text-gray-400 mt-2 max-w-xs px-4">Cadastre seu primeiro cartão e tenha controle total sobre suas faturas e limites.</p>
              <Button 
                variant="outline" 
                className="mt-8 px-8"
                onClick={() => navigate('/cartoes/novo')}
              >
                Cadastrar Meu Primeiro Cartão
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
