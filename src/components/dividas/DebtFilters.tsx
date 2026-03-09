import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';
import { StatusDivida, STATUS_LABELS } from '../../db/types';
import { useUIStore } from '../../store/useUIStore';

const statusOptions = [
  { value: 'ALL', label: 'Todos os status' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const sortOptions = [
  { value: 'createAt', label: 'Data de criação' },
  { value: 'dataVencimento', label: 'Data de vencimento' },
  { value: 'valor', label: 'Valor' },
  { value: 'devedorNome', label: 'Nome do devedor' },
];

type ViewMode = 'grid' | 'table';

interface DebtFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const DebtFilters: React.FC<DebtFiltersProps> = ({ viewMode, onViewModeChange }) => {
  const { filters, setSearch, setStatusFilter, setSortBy, setSortOrder, resetFilters } = useUIStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      {/* Search */}
      <div className="flex-1 w-full sm:w-auto">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setStatusFilter(e.target.value as StatusDivida | 'ALL')}
        />
      </div>

      {/* Sort */}
      <div className="w-full sm:w-44">
        <Select
          options={sortOptions}
          value={filters.sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof filters.sortBy)}
        />
      </div>

      {/* Sort Order */}
      <Button
        variant="secondary"
        size="md"
        onClick={() => setSortOrder(filters.sortOrder === 'asc' ? 'desc' : 'asc')}
        title={`Ordenar ${filters.sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
      >
        {filters.sortOrder === 'asc' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </Button>

      {/* View Toggle */}
      <div className="flex items-center bg-dark-600 border border-dark-300/50 rounded-xl p-1 gap-1">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Grade"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Tabela"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18" />
          </svg>
        </button>
      </div>

      {/* Reset */}
      {(filters.search || filters.status !== 'ALL') && (
        <Button variant="ghost" size="md" onClick={resetFilters} className="text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
};

