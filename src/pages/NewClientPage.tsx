import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { ClientForm } from '../components/clientes/ClientForm';
import { Button } from '../components/ui/Button';
import { createCliente } from '../db/hooks/useClientes';
import type { Cliente } from '../db/types';
import { toast } from 'sonner';

export const NewClientPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: Omit<Cliente, 'id' | 'createAt'>) => {
    setLoading(true);
    try {
      const id = await createCliente(data);
      toast.success('Cliente cadastrado com sucesso!');
      navigate(`/clientes/${id}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao cadastrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Topbar
        title="Novo Cliente"
        subtitle="Adicionar cliente à carteira"
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
          <ClientForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Cadastrar Cliente"
          />
        </div>
      </div>
    </Layout>
  );
};
