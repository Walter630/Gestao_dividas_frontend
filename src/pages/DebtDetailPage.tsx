import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { useDividaById, deleteDivida, updateDivida } from '../db/hooks/useDividas';
import { formatCurrency, formatDate, formatDateTime } from '../services/taxCalculator';
import { TAX_TYPE_LABELS, StatusDivida } from '../db/types';
import { differenceInDays } from 'date-fns';

export const DebtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const navigate = useNavigate();
  const divida = useDividaById(id);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteDivida(id);
      navigate('/dividas');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await updateDivida(id, { status: StatusDivida.PAGA });
    } finally {
      setStatusLoading(false);
    }
  };

  if (divida === undefined) {
    return (
      <Layout>
        <Topbar title="Detalhes" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
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
  const interest = divida.valorAtual - divida.valor;

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
                {isOverdue && divida.status !== StatusDivida.PAGA && (
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
              <p className="text-primary-400 text-3xl font-bold">{formatCurrency(divida.valorAtual)}</p>
              {interest > 0 && (
                <p className="text-red-400 text-sm">
                  +{formatCurrency(interest)} em juros
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Valores</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Valor original</span>
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
              {interest > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Juros acumulados</span>
                  <span className="text-red-400 text-sm font-medium">+{formatCurrency(interest)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-dark-300/30 flex justify-between">
                <span className="text-gray-300 text-sm font-semibold">Valor atual</span>
                <span className="text-primary-400 text-sm font-bold">{formatCurrency(divida.valorAtual)}</span>
              </div>
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
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Descrição</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{divida.descricao}</p>
        </Card>

        {/* Quick Actions */}
        {divida.status !== StatusDivida.PAGA && divida.status !== StatusDivida.CANCELADA && (
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
                Marcar como Paga
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
    </Layout>
  );
};

