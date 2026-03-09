import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { DebtForm } from '../components/dividas/DebtForm';
import { Button } from '../components/ui/Button';
import { useDividaById, updateDivida } from '../db/hooks/useDividas';
import type { DividaInput } from '../db/types';
import { format } from 'date-fns';

export const EditDebtPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const divida = useDividaById(id);

  const handleSubmit = async (data: DividaInput) => {
    if (!id) return;
    setLoading(true);
    try {
      await updateDivida(id, data);
      navigate(`/dividas/${id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (divida === undefined) {
    return (
      <Layout>
        <Topbar title="Editar Dívida" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!divida) {
    return (
      <Layout>
        <Topbar title="Editar Dívida" />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-400">Dívida não encontrada.</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/dividas')}>
            Voltar para lista
          </Button>
        </div>
      </Layout>
    );
  }

  // Format datetime-local value (requires "YYYY-MM-DDTHH:mm")
  const formatForInput = (iso: string) => {
    try {
      return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return iso;
    }
  };

  return (
    <Layout>
      <Topbar
        title="Editar Dívida"
        subtitle={divida.devedorNome}
        actions={
          <Button variant="ghost" size="md" onClick={() => navigate(-1)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
        }
      />

      <div className="p-4 lg:p-6 max-w-2xl animate-fade-in">
        <div className="bg-dark-600 border border-dark-300/50 rounded-2xl p-6 shadow-card">
          <DebtForm
            defaultValues={{
              devedorNome: divida.devedorNome,
              devedorEmail: divida.devedorEmail,
              valor: divida.valor,
              descricao: divida.descricao,
              dataVencimento: formatForInput(divida.dataVencimento),
              status: divida.status,
              taxType: divida.taxType,
              taxValue: divida.taxValue,
            }}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Salvar Alterações"
          />
        </div>
      </div>
    </Layout>
  );
};

