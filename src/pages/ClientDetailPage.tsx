import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { useClienteById } from '../db/hooks/useClientes';
import type { Divida } from '../db/types';
import { Button } from '../components/ui/Button';
import { DebtCard } from '../components/dividas/DebtCard';
import { deleteDivida, useAllDividas } from '../db/hooks/useDividas';
import { toast } from 'sonner';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cliente = useClienteById(id);
  
  const allDividas = useAllDividas();
  const dividas = React.useMemo(() => {
    if (!allDividas || !id) return undefined;
    return allDividas.filter(d => d.clienteId === id);
  }, [allDividas, id]);

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm('Deseja excluir esta dívida?')) return;
    try {
      await deleteDivida(debtId);
      toast.success('Dívida excluída. (Simulação sem rota)');
    } catch {
      toast.error('Erro ao excluir dívida.');
    }
  };

  if (cliente === undefined) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!cliente) {
    return (
      <Layout>
        <Topbar title="Cliente não encontrado" />
        <div className="p-6 text-center">
          <Button variant="primary" onClick={() => navigate('/clientes')}>Voltar para Clientes</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Topbar
        title="Perfil do Cliente"
        subtitle={cliente.nome}
        actions={
          <Button variant="ghost" size="md" onClick={() => navigate(-1)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="bg-dark-600 border border-dark-300/50 rounded-2xl p-6 flex flex-col md:flex-row shadow-card justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{cliente.nome}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {cliente.email && <span className="flex items-center gap-1.5">✉️ {cliente.email}</span>}
              {cliente.telefone && <span className="flex items-center gap-1.5">📱 {cliente.telefone}</span>}
              {cliente.documento && <span className="flex items-center gap-1.5">💳 {cliente.documento}</span>}
            </div>
          </div>
          <Link to={`/dividas/nova?cliente=${cliente.id}`}>
            <Button variant="primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Dívida para este Cliente
            </Button>
          </Link>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-4">Histórico de Dívidas ({dividas?.length || 0})</h3>
          {!dividas ? (
            <div className="flex justify-center p-10"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
          ) : dividas.length === 0 ? (
            <div className="bg-dark-600 rounded-2xl p-10 text-center border border-dark-300/50">
              <p className="text-gray-400">Nenhuma dívida atrelada a este cliente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dividas.map((d: Divida) => (
                <DebtCard key={d.id} divida={d} onDelete={handleDeleteDebt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
