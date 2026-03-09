import React from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { StatusDivida, TaxType, STATUS_LABELS, TAX_TYPE_LABELS } from '../../db/types';
import { calculateCurrentValue, formatCurrency } from '../../services/taxCalculator';
import type { DividaInput } from '../../db/types';

interface DebtFormFields {
  devedorNome: string;
  devedorEmail: string;
  valor: string;
  descricao: string;
  dataVencimento: string;
  status: string;
  taxType: string;
  taxValue: string;
}

interface DebtFormProps {
  defaultValues?: {
    devedorNome?: string;
    devedorEmail?: string;
    valor?: number;
    descricao?: string;
    dataVencimento?: string;
    status?: StatusDivida;
    taxType?: TaxType;
    taxValue?: number;
  };
  onSubmit: (data: DividaInput) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const taxTypeOptions = Object.entries(TAX_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export const DebtForm: React.FC<DebtFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar',
  loading,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DebtFormFields>({
    defaultValues: {
      status: defaultValues?.status ?? StatusDivida.PENDENTE,
      taxType: defaultValues?.taxType ?? TaxType.SEM_JUROS,
      taxValue: String(defaultValues?.taxValue ?? 0),
      valor: defaultValues?.valor !== undefined ? String(defaultValues.valor) : '',
      devedorNome: defaultValues?.devedorNome ?? '',
      devedorEmail: defaultValues?.devedorEmail ?? '',
      descricao: defaultValues?.descricao ?? '',
      dataVencimento: defaultValues?.dataVencimento ?? '',
    },
  });

  const watchedValues = watch();
  const numValor = parseFloat(watchedValues.valor) || 0;
  const numTaxValue = parseFloat(watchedValues.taxValue) || 0;
  const previewValue =
    numValor > 0 && watchedValues.dataVencimento
      ? calculateCurrentValue(
          numValor,
          watchedValues.taxType as TaxType,
          numTaxValue,
          watchedValues.dataVencimento
        )
      : null;

  const onFormSubmit = (data: DebtFormFields) => {
    onSubmit({
      devedorNome: data.devedorNome,
      devedorEmail: data.devedorEmail,
      valor: parseFloat(data.valor) || 0,
      descricao: data.descricao,
      dataVencimento: new Date(data.dataVencimento).toISOString(),
      status: data.status as StatusDivida,
      taxType: data.taxType as TaxType,
      taxValue: parseFloat(data.taxValue) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Debtor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome do Devedor"
          placeholder="João da Silva"
          error={errors.devedorNome?.message}
          required
          {...register('devedorNome', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
        />
        <Input
          label="E-mail do Devedor"
          type="email"
          placeholder="joao@email.com"
          error={errors.devedorEmail?.message}
          required
          {...register('devedorEmail', {
            required: 'E-mail é obrigatório',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
          })}
        />
      </div>

      {/* Value and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valor Original (R$)"
          type="number"
          step="0.01"
          min="0"
          placeholder="1000.00"
          error={errors.valor?.message}
          required
          leftIcon={<span className="text-xs font-bold">R$</span>}
          {...register('valor', {
            required: 'Valor é obrigatório',
            validate: (v) => parseFloat(v) > 0 || 'Valor deve ser maior que zero',
          })}
        />
        <Input
          label="Data de Vencimento"
          type="datetime-local"
          error={errors.dataVencimento?.message}
          required
          {...register('dataVencimento', { required: 'Data de vencimento é obrigatória' })}
        />
      </div>

      {/* Tax Type and Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Tipo de Juros"
          options={taxTypeOptions}
          error={errors.taxType?.message}
          required
          {...register('taxType')}
        />
        <Input
          label="Taxa de Juros (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="2.5"
          error={errors.taxValue?.message}
          rightIcon={<span className="text-xs font-bold">%</span>}
          hint={watchedValues.taxType === TaxType.SEM_JUROS ? 'Sem juros aplicados' : undefined}
          {...register('taxValue')}
          disabled={watchedValues.taxType === TaxType.SEM_JUROS}
        />
      </div>

      {/* Status */}
      <Select
        label="Status"
        options={statusOptions}
        error={errors.status?.message}
        required
        {...register('status')}
      />

      {/* Description */}
      <Textarea
        label="Descrição"
        placeholder="Descreva o motivo da dívida..."
        error={errors.descricao?.message}
        required
        {...register('descricao', { required: 'Descrição é obrigatória', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
      />

      {/* Value Preview */}
      {previewValue !== null && (
        <div className="bg-dark-500 border border-dark-300/50 rounded-xl p-4">
          <p className="text-gray-400 text-xs font-medium mb-1">Valor atual calculado</p>
          <p className="text-2xl font-bold text-primary-400">{formatCurrency(previewValue)}</p>
          {previewValue !== numValor && (
            <p className="text-gray-500 text-xs mt-1">
              Valor original: {formatCurrency(numValor)}
              {' · '}Juros: {formatCurrency(previewValue - numValor)}
            </p>
          )}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
};
