import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { DebtCard } from '../components/dividas/DebtCard';
import { DebtTable } from '../components/dividas/DebtTable';
import { DebtFilters } from '../components/dividas/DebtFilters';
import { ConfirmModal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useAllDividas, deleteDivida } from '../db/hooks/useDividas';
import { useUIStore } from '../store/useUIStore';
import type { Divida } from '../db/types';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'table';

export const DebtListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { filters, openDeleteModal, closeDeleteModal, isDeleteModalOpen, deletingId } = useUIStore();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const dividas = useAllDividas();

  const filtered = useMemo(() => {
    if (!dividas) return [];
    let result = [...dividas];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.devedorNome.toLowerCase().includes(q) ||
          (d.devedorEmail && d.devedorEmail.toLowerCase().includes(q)) ||
          d.descricao.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      result = result.filter((d) => d.status === filters.status);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[filters.sortBy as keyof Divida];
      let valB: any = b[filters.sortBy as keyof Divida];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [dividas, filters]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteDivida(deletingId);
      toast.success('Dívida excluída com sucesso!');
      closeDeleteModal();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao excluir a dívida.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const deletingDivida = dividas?.find((d) => d.id === deletingId);

  return (
    <Layout>
      <Topbar
        title="Dívidas"
        subtitle={`${filtered.length} registro(s) encontrado(s)`}
        actions={
          <Link to="/dividas/nova">
            <Button variant="primary" size="md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Dívida
            </Button>
          </Link>
        }
      />

      <div className="p-4 lg:p-6 animate-fade-in">
        <DebtFilters viewMode={viewMode} onViewModeChange={setViewMode} />

        {!dividas ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-600 border border-dark-300/50 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <DebtCard key={d.id} divida={d} onDelete={openDeleteModal} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-dark-500 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-400 font-medium mb-1">Nenhuma dívida encontrada</h3>
                <p className="text-gray-600 text-sm mb-4">Ajuste os filtros ou cadastre uma nova dívida</p>
                <Link to="/dividas/nova">
                  <Button variant="primary" size="md">Nova Dívida</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <DebtTable dividas={filtered} onDelete={openDeleteModal} />
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Excluir Dívida"
        message={`Tem certeza que deseja excluir a dívida de "${deletingDivida?.devedorNome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
      />
    </Layout>
  );
};

