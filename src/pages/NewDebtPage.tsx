import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { DebtForm } from '../components/dividas/DebtForm';
import { Button } from '../components/ui/Button';
import { createDivida } from '../db/hooks/useDividas';
import { useConfiguracoes } from '../db/hooks/useConfiguracoes';
import { createCliente } from '../db/hooks/useClientes';
import type { DividaInput } from '../db/types';
import { TaxType, StatusDivida } from '../db/types';
import { toast } from 'sonner';

export const NewDebtPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const config = useConfiguracoes();

  const handleSubmit = async (data: DividaInput, newClient?: { nome: string, email?: string, telefone?: string }) => {
    setLoading(true);
    try {
      let finalData = { ...data };
      if (newClient) {
        const clienteId = await createCliente({
          nome: newClient.nome,
          email: newClient.email,
          telefone: newClient.telefone,
        });
        finalData.clienteId = clienteId;
      }
      
      const id = await createDivida(finalData);
      toast.success('Dívida cadastrada com sucesso!');
      navigate(`/dividas/${id}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao cadastrar a dívida.');
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <Layout>
        <Topbar title="Nova Dívida" />
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

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
            defaultValues={{
              taxType: config.tipoJurosPadrao,
              taxValue: config.taxaPadrao,
              status: StatusDivida.PENDENTE
            }}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Cadastrar Dívida"
          />
        </div>
      </div>
    </Layout>
  );
};

