import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cardService } from '../../services/cardService';
import { purchaseService } from '../../services/purchaseService';
import { CartaoCredito, Parcela, StatusParcela } from '../../db/types';

export const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [card, setCard] = useState<CartaoCredito | null>(null);
  const [installments, setInstallments] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [fetchedCard, fetchedInstallments] = await Promise.all([
          cardService.getById(id),
          purchaseService.getInstallmentsByCard(id)
        ]);
        setCard(fetchedCard);
        setInstallments(fetchedInstallments);
      } catch (error) {
        console.error('Erro ao buscar detalhes do cartão:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const monthlyInvoice = useMemo(() => {
    return installments.filter(p => {
      const d = new Date(p.dataVencimento + 'T12:00:00');
      return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [installments, selectedMonth, selectedYear]);

  const totalInvoice = useMemo(() => {
    return monthlyInvoice.reduce((sum, p) => sum + p.valor, 0);
  }, [monthlyInvoice]);

  const handlePay = async (p: Parcela) => {
    if (!p.id) return;
    try {
      await purchaseService.payInstallment(p.id, {
        dataPagamento: new Date().toISOString().split('T')[0],
        valorPago: p.valor
      });
      // Refresh
      const updated = await purchaseService.getInstallmentsByCard(id!);
      setInstallments(updated);
    } catch (error) {
      console.error('Erro ao pagar parcela:', error);
    }
  };

  if (loading) return <Layout><div className="p-6">Carregando...</div></Layout>;
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
            <h1 className="text-3xl font-bold text-white tracking-tight">{card.nome}</h1>
            <p className="text-gray-400 mt-1">Vencimento: Dia {card.diaVencimento} | Fechamento: Dia {card.diaFechamento}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => navigate('/cartoes/compra/nova')}>Novo Lançamento</Button>
          </div>
        </header>

        {/* Invoice Period Selector */}
        <div className="flex items-center gap-4 bg-dark-600 p-2 rounded-xl w-fit">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(m => m === 1 ? 12 : m - 1)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Button>
          <span className="text-white font-semibold min-w-[120px] text-center capitalize">
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(m => m === 12 ? 1 : m + 1)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Valor da Fatura"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoice)}
            icon={<svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            color="primary"
          />
          <StatCard 
            title="Limite Comprom."
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installments.reduce((s, p) => p.status === StatusParcela.PENDENTE ? s + p.valor : s, 0))}
            icon={<svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            color="danger"
          />
          <StatCard 
            title="Status da Fatura"
            value={monthlyInvoice.every(p => p.status === StatusParcela.PAGA) && monthlyInvoice.length > 0 ? "QUITADA" : "ABERTA"}
            icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color={monthlyInvoice.every(p => p.status === StatusParcela.PAGA) && monthlyInvoice.length > 0 ? "success" : "info"}
          />
        </div>

        {/* Invoice List */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-500/50 border-b border-dark-300/30">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição / Loja</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Parcela</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data Compra</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300/20">
                {monthlyInvoice.length > 0 ? (
                  monthlyInvoice.map((p, idx) => (
                    <tr key={idx} className="hover:bg-dark-400/30 transition-colors">
                      <td className="p-4 text-sm">
                        <p className="text-white font-medium">Compra Parcelada</p>
                        <p className="text-gray-500 text-xs">Loja: Em breve...</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {p.numeroParcela}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(p.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-sm font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                      </td>
                      <td className="p-4 text-sm">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-4 text-right">
                        {p.status === StatusParcela.PENDENTE && (
                          <Button variant="ghost" size="sm" onClick={() => handlePay(p)}>
                            Pagar
                          </Button>
                        )}
                        {p.status === StatusParcela.PAGA && (
                          <span className="text-emerald-500 text-xs font-medium">Confirmado</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                      Nenhum lançamento para este período.
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
