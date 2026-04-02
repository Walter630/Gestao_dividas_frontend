import React from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { StatusDivida, TaxType, STATUS_LABELS, TAX_TYPE_LABELS, PaymentMode, PAYMENT_MODE_LABELS } from '../../db/types';
import { calculateCurrentValue, formatCurrency } from '../../services/taxCalculator';
import type { DividaInput } from '../../db/types';
import { useAllClientes } from '../../db/hooks/useClientes';

interface DebtFormFields {
  clienteId: string;
  clienteNome?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  valor: string;
  descricao: string;
  dataVencimento: string;
  status: string;
  taxType: string;
  taxValue: string;
  paymentMode: string;
}

interface DebtFormProps {
  defaultValues?: {
    clienteId?: string;
    devedorNome?: string;
    devedorEmail?: string;
    valor?: number;
    descricao?: string;
    dataVencimento?: string;
    status?: StatusDivida;
    taxType?: TaxType;
    taxValue?: number;
    paymentMode?: PaymentMode;
  };
  onSubmit: (data: DividaInput, newClient?: { nome: string, email?: string, telefone?: string }) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const taxTypeOptions = Object.entries(TAX_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const paymentModeOptions = Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => ({ value, label }));

export const DebtForm: React.FC<DebtFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar',
  loading,
}) => {
  const [isQuickAdd, setIsQuickAdd] = React.useState(false);
  const { clientes } = useAllClientes();
  const clientOptions = clientes?.map((c) => ({ value: c.id!, label: c.nome })) || [];

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
      paymentMode: defaultValues?.paymentMode ?? PaymentMode.PARCELADO,
      valor: defaultValues?.valor !== undefined ? String(defaultValues.valor) : '',
      clienteId: defaultValues?.clienteId ?? '',
      clienteNome: '',
      clienteEmail: '',
      clienteTelefone: '',
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
          watchedValues.dataVencimento,
          [],
          watchedValues.paymentMode as PaymentMode
        )
      : null;

  const onFormSubmit = (data: DebtFormFields) => {
    let selectedClient = clientes?.find((c) => c.id === data.clienteId);
    let newClientData = undefined;

    if (isQuickAdd) {
      newClientData = {
        nome: data.clienteNome || '',
        email: data.clienteEmail,
        telefone: data.clienteTelefone,
      };
    }

    onSubmit({
      clienteId: data.clienteId,
      devedorNome: isQuickAdd ? (data.clienteNome || '') : (selectedClient?.nome || 'Desconhecido'),
      devedorEmail: isQuickAdd ? (data.clienteEmail || '') : (selectedClient?.email || ''),
      valor: parseFloat(data.valor) || 0,
      descricao: data.descricao,
      dataVencimento: new Date(data.dataVencimento).toISOString(),
      status: data.status as StatusDivida,
      taxType: data.taxType as TaxType,
      taxValue: parseFloat(data.taxValue) || 0,
      paymentMode: data.paymentMode as PaymentMode,
    }, newClientData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Debtor Info */}
      <div className="bg-dark-500/30 border border-dark-400 rounded-2xl p-4 mb-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-medium text-sm">Informações do Cliente</h4>
          <button
            type="button"
            onClick={() => setIsQuickAdd(!isQuickAdd)}
            className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            {isQuickAdd ? '← Selecionar cliente existente' : '+ Novo cliente rápido'}
          </button>
        </div>

        {isQuickAdd ? (
          <div className="space-y-4 animate-fade-in">
            <Input
              label="Nome do Cliente *"
              placeholder="Ex: João da Silva"
              error={errors.clienteNome?.message}
              {...register('clienteNome', { required: isQuickAdd ? 'Nome é obrigatório' : false })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="joao@example.com"
                {...register('clienteEmail')}
              />
              <Input
                label="WhatsApp"
                placeholder="5511999999999"
                {...register('clienteTelefone')}
              />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Select
              label="Selecione o Cliente"
              options={clientOptions}
              error={errors.clienteId?.message}
              required
              {...register('clienteId', { required: isQuickAdd ? false : 'Selecione um cliente' })}
            />
          </div>
        )}
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

      {/* Payment Mode */}
      <Select
        label="Modo de Pagamento"
        options={paymentModeOptions}
        error={errors.paymentMode?.message}
        required
        {...register('paymentMode')}
      />
      <p className="text-xs text-gray-500 -mt-3">
        {watchedValues.paymentMode === PaymentMode.JUROS_MENSAL
          ? '💡 Juros pagos por mês, valor principal quitado de uma vez.'
          : '💡 Pagamentos descontados do valor total (amortização).'}
      </p>

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
