import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { DebtForm } from '../components/dividas/DebtForm';
import { Button } from '../components/ui/Button';
import { createDivida } from '../db/hooks/useDividas';
import type { DividaInput } from '../db/types';
import { toast } from 'sonner';

export const NewDebtPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: DividaInput) => {
    setLoading(true);
    try {
      const id = await createDivida(data);
      toast.success('Dívida cadastrada com sucesso!');
      navigate(`/dividas/${id}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao cadastrar a dívida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Topbar
        title="Nova Dívida"
        subtitle="Cadastre uma nova dívida"
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
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Cadastrar Dívida"
          />
        </div>
      </div>
    </Layout>
  );
};

