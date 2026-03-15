import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { useAllClientes, deleteCliente } from '../db/hooks/useClientes';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export const ClientListPage: React.FC = () => {
  const clientes = useAllClientes();
  const [q, setQ] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    try {
      await deleteCliente(id);
      toast.success('Cliente excluído com sucesso.');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao excluir.');
    }
  };

  const filtered = clientes?.filter(c => 
    c.nome.toLowerCase().includes(q.toLowerCase()) || 
    c.email?.toLowerCase().includes(q.toLowerCase()) ||
    c.telefone?.includes(q)
  );

  return (
    <Layout>
      <Topbar
        title="Meus Clientes"
        subtitle="Gerencie sua carteira de clientes"
        actions={
          <Link to="/clientes/novo">
            <Button variant="primary" size="md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Cliente
            </Button>
          </Link>
        }
      />

      <div className="p-4 lg:p-6 animate-fade-in">
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            className="flex-1 bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!clientes ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered?.length === 0 ? (
          <div className="bg-dark-600 rounded-2xl p-10 text-center border border-dark-300/50">
            <p className="text-gray-400 mb-4">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered?.map((c) => (
              <div key={c.id} className="bg-dark-600 border border-dark-300/50 rounded-2xl p-5 hover:border-primary-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold">{c.nome}</h3>
                    {c.documento && <p className="text-xs text-gray-500">Doc: {c.documento}</p>}
                  </div>
                </div>
                {c.email && (
                  <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                    ✉️ {c.email}
                  </p>
                )}
                {c.telefone && (
                  <p className="text-sm text-gray-400 flex items-center gap-2 mb-3">
                    📱 {c.telefone}
                  </p>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t border-dark-400">
                  <Link to={`/clientes/${c.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Perfil</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id!)} className="text-red-400">
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
