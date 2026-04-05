import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { PaymentModal } from '../components/dividas/PaymentModal';
import { useDividaById, deleteDivida, updateDivida, addPagamento, useDividaBreakdown } from '../db/hooks/useDividas';
import { useConfiguracoes } from '../db/hooks/useConfiguracoes';
import { useClienteById } from '../db/hooks/useClientes';
import { formatCurrency, formatDate, formatDateTime, calculateDebtBreakdown, calculateMonthlyInterest } from '../services/taxCalculator';
import { TAX_TYPE_LABELS, PAYMENT_MODE_LABELS, StatusDivida, PaymentMode } from '../db/types';
import type { PagamentoTipo } from '../db/types';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export const DebtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();
  const divida = useDividaById(id);
  const { breakdown: backendBreakdown, loading: breakdownLoading, refresh: refreshBreakdown } = useDividaBreakdown(id);
  const config = useConfiguracoes();
  const cliente = useClienteById(divida?.clienteId);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteDivida(id);
      toast.success('Dívida excluída com sucesso');
      navigate('/dividas');
    } catch (e) {
      toast.error('Erro ao excluir a dívida');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await updateDivida(id, { status: StatusDivida.PAGO });
      toast.success('Dívida marcada como paga!');
    } catch (e) {
      toast.error('Erro ao atualizar a dívida');
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePayment = async (valor: number, data: string, tipo: PagamentoTipo) => {
    if (!id) return;
    setPaymentLoading(true);
    try {
      await addPagamento(id, valor, data, tipo);
      toast.success(
        tipo === 'quitacao'
          ? 'Dívida quitada com sucesso!'
          : tipo === 'juros'
            ? 'Pagamento de juros registrado!'
            : 'Pagamento registrado com sucesso!'
      );
      setPaymentOpen(false);
      refreshBreakdown(); // Refresh breakdown after payment
    } catch (e) {
      toast.error('Erro ao registrar o pagamento');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (divida === undefined) {
    return (
      <Layout>
        <Topbar title="Detalhes" />
        <div className="flex items-center justify-center p-8 h-64">
           {/* Skeleton Loader for DebtDetail */}
           <div className="w-full max-w-4xl space-y-6 animate-pulse">
             <div className="h-40 bg-dark-500 rounded-2xl w-full"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="h-64 bg-dark-500 rounded-2xl w-full"></div>
               <div className="h-64 bg-dark-500 rounded-2xl w-full"></div>
             </div>
           </div>
        </div>
      </Layout>
    );
  }

  if (!divida) {
    return (
      <Layout>
        <Topbar title="Detalhes" />
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <p className="text-gray-400 mb-4">Dívida não encontrada.</p>
          <Button variant="primary" onClick={() => navigate('/dividas')}>Voltar para lista</Button>
        </div>
      </Layout>
    );
  }

  const daysUntilDue = differenceInDays(new Date(divida.dataVencimento), new Date());
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;
  
  // Calculate full breakdown (use backend if available, fallback to local)
  const paymentMode = divida.paymentMode || PaymentMode.PARCELADO;
  const localBreakdown = calculateDebtBreakdown(
    divida.valor,
    divida.taxType,
    divida.taxValue,
    divida.createAt, 
    paymentMode,
    divida.pagamentos || []
  );
  
  const breakdown = backendBreakdown || localBreakdown;
  
  const monthlyInterest = calculateMonthlyInterest(divida.valor, divida.taxType, divida.taxValue);
  const isJurosMensal = paymentMode === PaymentMode.JUROS_MENSAL;

  const handleWhatsApp = () => {
    if (!cliente?.telefone || !config?.whatsappTemplate) {
      toast.error('Telefone do cliente ou template não configurados.');
      return;
    }
    
    let msg = config.whatsappTemplate;
    msg = msg.replace(/{nome}/g, divida.devedorNome);
    msg = msg.replace(/{valorAtual}/g, formatCurrency(divida.valorAtual));
    msg = msg.replace(/{dataVencimento}/g, formatDate(divida.dataVencimento));
    
    // Clean phone number (leave only digits)
    const phone = cliente.telefone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const tipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'juros': return 'Juros';
      case 'quitacao': return 'Quitação';
      case 'parcela': return 'Parcela';
      default: return 'Pagamento';
    }
  };

  const tipoColor = (tipo: string) => {
    switch (tipo) {
      case 'juros': return 'text-amber-400 bg-amber-500/10';
      case 'quitacao': return 'text-emerald-400 bg-emerald-500/10';
      default: return 'text-primary-400 bg-primary-500/10';
    }
  };

  return (
    <Layout>
      <Topbar
        title="Detalhes da Dívida"
        subtitle={divida.devedorNome}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={() => navigate(-1)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Button>
            <Link to={`/dividas/${id}/editar`}>
              <Button variant="secondary" size="md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            </Link>
            <Button variant="danger" size="md" onClick={() => setDeleteOpen(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </Button>
          </div>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 max-w-4xl animate-fade-in">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-dark-500 to-dark-600 border border-dark-300/50 rounded-2xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={divida.status} size="md" />
                <span className={`text-xs px-2 py-1 rounded-lg border ${
                  isJurosMensal
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                }`}>
                  {PAYMENT_MODE_LABELS[paymentMode]}
                </span>
                {isOverdue && divida.status !== StatusDivida.PAGO && (
                  <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg animate-pulse">
                    ⚠ Vencida
                  </span>
                )}
                {isDueSoon && !isOverdue && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                    🔔 Vence em breve
                  </span>
                )}
              </div>
              <h2 className="text-white text-2xl font-bold">{divida.devedorNome}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{divida.devedorEmail}</p>
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-sm">Valor atual</p>
              <p className="text-primary-400 text-3xl font-bold">{formatCurrency(breakdown.valorAtual)}</p>
              {breakdown.jurosAcumulados > 0 && (
                <p className="text-red-400 text-sm">
                  +{formatCurrency(breakdown.jurosAcumulados)} em juros
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Card (Valores detalhados) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Valores</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Valor original (principal)</span>
                <span className="text-white text-sm font-medium">{formatCurrency(divida.valor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Tipo de juros</span>
                <span className="text-white text-sm font-medium">{TAX_TYPE_LABELS[divida.taxType]}</span>
              </div>
              {divida.taxValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Taxa</span>
                  <span className="text-white text-sm font-medium">{divida.taxValue}%</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-dark-300/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Juros acumulados</span>
                  <span className="text-red-400 text-sm font-medium">+{formatCurrency(breakdown.jurosAcumulados)}</span>
                </div>
                {isJurosMensal && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Juros já pagos</span>
                      <span className="text-emerald-400 text-sm font-medium">-{formatCurrency(breakdown.jurosPagos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Juros pendentes</span>
                      <span className="text-amber-400 text-sm font-medium">{formatCurrency(breakdown.jurosPendentes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Saldo do principal</span>
                      <span className="text-white text-sm font-medium">{formatCurrency(breakdown.saldoPrincipal)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-dark-300/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Total pago</span>
                  <span className="text-emerald-400 text-sm font-medium">{formatCurrency(breakdown.totalPago)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm font-semibold">Valor atual devendo</span>
                  <span className="text-primary-400 text-sm font-bold">{formatCurrency(breakdown.valorAtual)}</span>
                </div>
              </div>

              {isJurosMensal && breakdown.jurosPendentes > 0 && (
                <div className="mt-3 p-3 bg-dark-500/50 rounded-lg border border-dark-300/30">
                  <p className="text-xs text-gray-400">
                    💡 Juros pendentes: <span className="text-amber-400 font-semibold">{formatCurrency(breakdown.jurosPendentes)}</span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Datas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Criação</span>
                <span className="text-white text-sm font-medium">{formatDateTime(divida.createAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Última atualização</span>
                <span className="text-white text-sm font-medium">{formatDateTime(divida.updateAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Vencimento</span>
                <span
                  className={`text-sm font-medium ${
                    isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {formatDate(divida.dataVencimento)}
                  {isOverdue && ` (${Math.abs(daysUntilDue)}d atrás)`}
                  {isDueSoon && !isOverdue && ` (${daysUntilDue}d)`}
                </span>
              </div>
              {divida.lembreteEnviado && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Último lembrete</span>
                  <span className="text-gray-400 text-sm">{formatDateTime(divida.lembreteEnviado)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-dark-300/30">
                <span className="text-gray-500 text-sm">Modo de pagamento</span>
                <span className="text-white text-sm font-medium">{PAYMENT_MODE_LABELS[paymentMode]}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Descrição</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{divida.descricao}</p>
        </Card>

        {/* Payments History */}
        {(divida.pagamentos && divida.pagamentos.length > 0) && (
          <Card>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Histórico de Pagamentos</h3>
            <div className="space-y-3">
              {[...divida.pagamentos].sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-dark-500/50 rounded-lg border border-dark-300/30">
                  <div className="flex flex-col">
                     <span className="text-primary-400 font-medium text-sm">{formatCurrency(p.valor)}</span>
                     <span className="text-gray-500 text-xs">{formatDateTime(p.data)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${tipoColor(p.tipo || 'parcela')}`}>
                    {tipoLabel(p.tipo || 'parcela')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {divida.status !== StatusDivida.PAGO && divida.status !== StatusDivida.CANCELADA && (
          <Card>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="success"
                size="md"
                loading={statusLoading}
                onClick={handleMarkPaid}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Marcar como Paga (Quitar)
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setPaymentOpen(true)}
              >
                {isJurosMensal ? '💰 Registrar Pagamento' : 'Adicionar Pagamento'}
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={handleWhatsApp}
                disabled={!cliente?.telefone}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Cobrar WhatsApp
              </Button>
              <Link to={`/dividas/${id}/editar`}>
                <Button variant="secondary" size="md">
                  Alterar Status
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Dívida"
        message={`Tem certeza que deseja excluir a dívida de "${divida.devedorNome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
      />
      
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePayment}
        loading={paymentLoading}
        paymentMode={paymentMode}
        suggestedInterest={breakdown.jurosPendentes}
        principalBalance={breakdown.saldoPrincipal}
      />
    </Layout>
  );
};
