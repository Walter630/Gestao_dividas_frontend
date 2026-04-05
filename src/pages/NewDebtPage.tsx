import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { DebtForm } from '../components/dividas/DebtForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { createDivida, useAllDividas } from '../db/hooks/useDividas';
import { useConfiguracoes } from '../db/hooks/useConfiguracoes';
import { createCliente } from '../db/hooks/useClientes';
import type { DividaInput } from '../db/types';
import { TaxType, StatusDivida } from '../db/types';
import { toast } from 'sonner';

export const NewDebtPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const allDividas = useAllDividas();
  const navigate = useNavigate();
  const config = useConfiguracoes();

  const handleSubmit = async (data: DividaInput, newClient?: { nome: string, email?: string, telefone?: string }) => {
    // Verificação preemptiva amigável do frontend (SaaS behavior)
    if (allDividas && allDividas.length >= 5) {
      // Como não criamos um Hook global de plano ainda, validamos pela quantidade base do FREE.
      // E chamamos o Modal direto se já tem 5.
      setIsLimitModalOpen(true);
      return;
    }

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
    } catch (e: any) {
      console.error(e);
      // Se ocorreu 400 Bad Request e o usuário já tem 5 dívidas, lançamos o modal também
      if (e.response?.status === 400) {
         if (allDividas && allDividas.length >= 5) {
           setIsLimitModalOpen(true);
           return;
         }
      }
      toast.error(e.response?.data?.message || 'Erro ao cadastrar a dívida. Verifique a data de vencimento.');
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
              paymentMode: config.paymentModePadrao,
              status: StatusDivida.PENDENTE
            }}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Cadastrar Dívida"
          />
        </div>
      </div>

      <Modal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        title="Limite Atingido"
      >
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white text-lg font-bold">Você atingiu o limite do Plano Gratuito</h4>
            <p className="text-gray-400 text-sm mt-2">
              Seu plano atual permite cadastrar no máximo 5 dívidas ativas. Para cadastrar clientes ilimitados e continuar crescendo, faça o upgrade para o plano Profissional.
            </p>
          </div>
          <div className="flex gap-4 w-full mt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsLimitModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/assinatura')}>
              Ver Planos PRO
            </Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
};

