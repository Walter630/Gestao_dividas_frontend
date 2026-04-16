import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { purchaseService } from '../../services/purchaseService';
import { cardService } from '../../services/cardService';
import { CartaoCredito, Parcela, StatusParcela } from '../../db/types';
import { formatDisplayDate, parseJavaDate } from '../../utils/dateUtils';
import { calcularParcelas } from '../../utils/installmentUtils';

export const PurchaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [purchase, setPurchase] = useState<any | null>(null);
  const [installments, setInstallments] = useState<Parcela[]>([]);
  const [card, setCard] = useState<CartaoCredito | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const all = await purchaseService.getAll();
        const found = all.find((p: any) => {
            const currentId = String(p.id || `virtual-buy-${p.loja}-${p.valorTotal}-${p.dataCompra}`);
            return currentId === String(id);
        });
        
        if (found) {
          setPurchase(found);
          
          const cardId = found.cartaoCredito?.id || found.cartaoId || found.tbCartaoCreditoId;
          if (cardId) {
            const fetchedCard = await cardService.getById(cardId);
            setCard(fetchedCard);

            const virtual = calcularParcelas(
              found.valorTotal,
              found.quantidadeParcelas,
              found.dataCompra,
              fetchedCard.diaFechamento,
              fetchedCard.diaVencimento
            );
            setInstallments(virtual);
          }
        }
      } catch (error) {
        // Handled
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!purchase) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Lançamento não encontrado</h2>
          <Button onClick={() => navigate('/cartoes')}>Voltar para Cartões</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="-ml-2 mb-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
              onClick={() => navigate(-1)}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
            >
              Voltar para o Cartão
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-500/20 rounded-2xl border border-primary-500/30">
                 <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  {purchase.loja || 'Compra Parcelada'}
                </h1>
                <p className="text-emerald-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {purchase.descricao || purchase.description || 'Lançamento Verificado'}
                </p>
              </div>
            </div>
          </div>
          <Card className="bg-dark-600/50 border-dark-300/30 backdrop-blur-xl p-4">
             <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Data da Transação</p>
             <p className="text-white text-xl font-bold">{formatDisplayDate(purchase.dataCompra)}</p>
          </Card>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Investimento Total"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.valorTotal)}
            color="primary"
            icon={<svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            title="Plano de Pagamento"
            value={`${purchase.quantidadeParcelas}x Parcelas`}
            color="info"
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard 
            title="Cartão de Crédito"
            value={card?.name || purchase.cartaoCredito?.name || 'Nubank'}
            color="success"
            icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          />
        </div>

        <Card title="Detalhamento das Parcelas" className="overflow-hidden p-0 border-dark-300/30 shadow-2xl shadow-primary-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-500/80 border-b border-dark-300/30">
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Ordem</th>
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Vencimento</th>
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Valor da Parcela</th>
                  <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300/20">
                {installments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-primary-500/5 transition-all duration-300 group">
                    <td className="p-5 text-sm text-white font-bold group-hover:text-primary-400">
                      {p.numeroParcela}ª Parcela
                    </td>
                    <td className="p-5 text-sm text-gray-400 group-hover:text-gray-200">
                      {formatDisplayDate(p.dataVencimento)}
                    </td>
                    <td className="p-5 text-sm font-black text-white group-hover:scale-105 transition-transform origin-left">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                    </td>
                    <td className="p-5 text-sm">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="bg-primary-500/5 border border-primary-500/20 p-6 rounded-2xl">
           <h3 className="text-primary-400 font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Nota sobre pagamentos
           </h3>
           <p className="text-gray-400 text-sm leading-relaxed">
              O pagamento das parcelas individuais deve ser realizado através da tela principal do cartão correspondente, 
              clicando no botão "Pagar" ao lado da parcela devida no mês atual. Esta página serve apenas para visualização 
              do plano completo de parcelamento.
           </p>
        </div>
      </div>
    </Layout>
  );
};
