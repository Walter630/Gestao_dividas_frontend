import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cardService } from '../../services/cardService';
import { purchaseService } from '../../services/purchaseService';
import { CartaoCredito, Parcela, StatusParcela } from '../../db/types';
import { formatDisplayDate, parseJavaDate } from '../../utils/dateUtils';
import { calcularParcelas } from '../../utils/installmentUtils';

export const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<CartaoCredito | null>(null);
  const [installments, setInstallments] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // Novo: Modo "Ver Tudo"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedCard = await cardService.getById(id);
        setCard(fetchedCard);

        let allPurchases: any[] = [];
        try {
          allPurchases = await purchaseService.getAll();
        } catch (e) {
          // Handled
        }

        const cardPurchases = allPurchases.filter(p =>
          p.cartaoCredito?.id === id || p.cartaoId === id || p.tbCartaoCreditoId === id
        );

        let fetchedInstallments: Parcela[] = [];
        try {
          // Busca direta por cartão (API)
          fetchedInstallments = await purchaseService.getInstallmentsByCard(id);

          // FALLBACK TÉCNICO: Se o banco não tem as parcelas, mas temos as compras, geramos localmente
          if (fetchedInstallments.length === 0 && cardPurchases.length > 0) {
            const virtualInstallments: Parcela[] = [];
            cardPurchases.forEach(compra => {
              // Gera um ID único de segurança caso o banco não envie
              const uniqueId = compra.id || `virtual-buy-${compra.loja}-${compra.valorTotal}-${compra.dataCompra}`;
              
              const calculated = calcularParcelas(
                compra.valorTotal,
                compra.quantidadeParcelas,
                compra.dataCompra,
                fetchedCard.diaFechamento,
                fetchedCard.diaVencimento
              );

              // Adiciona metadados da compra em cada parcela para exibição
              calculated.forEach(p => {
                virtualInstallments.push({
                  ...p,
                  id: `virtual-inst-${uniqueId}-${p.numeroParcela}`,
                  compraId: uniqueId,
                  // Campos extras para a tabela
                  compraLoja: compra.loja,
                  compraDescricao: compra.descricao || compra.description || compra.detalhe || 'Compra Parcelada'
                } as any);
              });
            });

            fetchedInstallments = virtualInstallments;
          }

          // Segundo fallback: se ainda estiver vazio, tenta busca mensal geral
          if (fetchedInstallments.length === 0) {
            fetchedInstallments = await purchaseService.getInstallmentsByMonth(selectedYear, selectedMonth);
          }
        } catch (err) {
          fetchedInstallments = await purchaseService.getInstallmentsByMonth(selectedYear, selectedMonth);
        }

        setInstallments(fetchedInstallments);
      } catch (error) {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, selectedMonth, selectedYear]);

  // Filtra as parcelas para o período selecionado (ou todas)
  const filteredInstallments = useMemo(() => {
    if (showAll) {
      // Fazendo cópia antes do sort para não mutar o state original
      return [...installments].sort((a, b) => {
          const da = new Date(parseJavaDate(a.dataVencimento) + 'T12:00:00').getTime();
          const db = new Date(parseJavaDate(b.dataVencimento) + 'T12:00:00').getTime();
          return da - db;
      });
    }

    return installments.filter(p => {
      const dateStr = parseJavaDate(p.dataVencimento);
      if (!dateStr) return false;
      const d = new Date(dateStr + 'T12:00:00');
      return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [installments, selectedMonth, selectedYear, showAll]);

  // Total da fatura do mês selecionado
  const totalInvoice = useMemo(() => {
    return filteredInstallments
      .filter(p => {
         if (showAll) {
             const dateStr = parseJavaDate(p.dataVencimento);
             const d = new Date(dateStr + 'T12:00:00');
             return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
         }
         return true;
      })
      .reduce((sum, p) => sum + (p.valor || 0), 0);
  }, [filteredInstallments, selectedMonth, selectedYear, showAll]);

  // CÁLCULO DINÂMICO DE LIMITE: Subtrai todas as parcelas pendentes de QUALQUER mês
  const dynamicLimit = useMemo(() => {
    if (!card) return 0;
    const totalPending = installments
      .filter(p => p.status === StatusParcela.PENDENTE)
      .reduce((sum, p) => sum + (p.valor || 0), 0);
    
    return (card.valorLimite || 0) - totalPending;
  }, [card, installments]);

  const handlePay = async (p: Parcela) => {
    // Se ainda for virtual (sem ID real do banco), avisa o usuário para recarregar
    if (!p.id || p.id.toString().startsWith('virtual-')) {
        alert('Esta parcela ainda não foi sincronizada com o banco de dados. Tente recarregar a página para obter os dados reais gerados pelo seu Java.');
        return;
    }

    try {
      await purchaseService.payInstallment(p.id, {
        ...p,
        status: StatusParcela.PAGA,
        dataPagamento: `${new Date().toISOString().split('T')[0]}T12:00:00`,
        valorPago: p.valor
      });
      
      // Recarrega os dados do cartão e parcelas após pagar
      const updated = await purchaseService.getInstallmentsByCard(id!);
      setInstallments(updated);
    } catch (error) {
      console.error('Erro ao pagar parcela:', error);
      alert('Erro ao processar pagamento no servidor.');
    }
  };

  const handleDeleteCard = async () => {
    if (!id || !window.confirm(`Tem certeza que deseja excluir o cartão "${card?.name}"? Todas as compras e parcelas vinculadas a este cartão serão removidas permanentemente.`)) return;

    try {
      setLoading(true);
      await cardService.delete(id);
      navigate('/cartoes');
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      alert('Não foi possível excluir o cartão.');
      setLoading(false);
    }
  };

  if (loading && !card) return <Layout><div className="p-6">Carregando...</div></Layout>;
  if (!card) return <Layout><div className="p-6">Cartão não encontrado</div></Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2"
              onClick={() => navigate('/cartoes')}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
            >
              Voltar para Cartões
            </Button>
            <h1 className="text-3xl font-bold text-white tracking-tight">{card.name}</h1>
            <p className="text-gray-400 mt-1">Fechamento: Dia {card.diaFechamento} | Vencimento: Dia {card.diaVencimento}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/cartoes/compra/nova')}>Novo Lançamento</Button>
            <Button variant="danger" onClick={handleDeleteCard} loading={loading}>Excluir Cartão</Button>
          </div>
        </header>

        {/* Invoice Period Selector and Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-dark-600 p-2 rounded-xl w-fit">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedMonth(m => m === 1 ? 12 : m - 1)}
                disabled={showAll}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Button>
            <span className={`text-white font-semibold min-w-[120px] text-center capitalize ${showAll ? 'opacity-30' : ''}`}>
              {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedMonth(m => m === 12 ? 1 : m + 1)}
                disabled={showAll}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>

          <Button 
            variant={showAll ? "primary" : "outline"} 
            size="sm"
            onClick={() => setShowAll(!showAll)}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
          >
            {showAll ? "Ver por Mês" : "Ver Tudo"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={showAll ? "Fatura Deste Mês" : "Fatura Selecionada"}
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoice)}
            icon={<svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            color="primary"
          />
          <StatCard
            title={showAll ? "Total de Lançamentos" : "Lançamentos no Mês"}
            value={filteredInstallments.length.toString()}
            icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            color="success"
          />
          <StatCard
            title="Limite Disponível (Real)"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dynamicLimit)}
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="info"
          />
        </div>

        {/* Invoice List */}
        <Card className="overflow-hidden p-0 border-dark-300/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-500/50 border-b border-dark-300/30">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição / Loja</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Parcela</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vencimento</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300/20">
                {filteredInstallments.length > 0 ? (
                  filteredInstallments.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-dark-400/30 transition-colors">
                      <td className="p-4 text-sm">
                        <p className="text-white font-medium">{(p as any).compraLoja || (p as any).compra?.loja || (p as any).compraId?.loja || 'Lançamento'}</p>
                        <p className="text-gray-500 text-xs">{(p as any).compraDescricao || (p as any).compra?.descricao || (p as any).compraId?.descricao || 'Parcela de cartão'}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300 font-mono">
                        {p.numeroParcela}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {formatDisplayDate(p.dataVencimento)}
                      </td>
                      <td className="p-4 text-sm font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                      </td>
                      <td className="p-4 text-sm">
                        <StatusBadge status={p.status} />
                        {p.id?.toString().startsWith('virtual-') && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase">
                                Virtual
                            </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {/* Botão de Ver Detalhes (Olho) */}
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-gray-400 hover:text-white"
                             title="Ver detalhes da compra"
                             onClick={() => navigate(`/cartoes/compra/${(p as any).compraId || p.compra?.id}`)}
                             icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                           />

                           {p.status === StatusParcela.PENDENTE && (
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => handlePay(p)}
                               className={`bg-primary-500/10 border-primary-500/30 hover:bg-primary-500/20 text-primary-400 ${p.id?.toString().startsWith('virtual-') ? 'opacity-50 cursor-not-allowed' : ''}`}
                             >
                               Pagar
                             </Button>
                           )}
                           {p.status === StatusParcela.PAGA && (
                             <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                               Confirmado
                             </span>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 italic space-y-3">
                        <div className="bg-dark-500 p-4 rounded-full mb-2">
                          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <p className="text-lg">Nenhum lançamento encontrado para este período.</p>
                        <p className="text-sm">Tente mudar o mês ou ano no seletor acima.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
