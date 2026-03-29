import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { PaymentMode } from '../../db/types';
import type { PagamentoTipo } from '../../db/types';
import { formatCurrency } from '../../services/taxCalculator';

interface PaymentFormFields {
  valor: string;
  data: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (valor: number, data: string, tipo: PagamentoTipo) => Promise<void>;
  loading?: boolean;
  paymentMode?: PaymentMode;
  suggestedInterest?: number;
  principalBalance?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  paymentMode = PaymentMode.PARCELADO,
  suggestedInterest = 0,
  principalBalance = 0,
}) => {
  const [paymentType, setPaymentType] = useState<PagamentoTipo>(
    paymentMode === PaymentMode.JUROS_MENSAL ? 'juros' : 'parcela'
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PaymentFormFields>({
    defaultValues: {
      data: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      valor: paymentMode === PaymentMode.JUROS_MENSAL && suggestedInterest > 0
        ? suggestedInterest.toFixed(2)
        : '',
    }
  });

  const onFormSubmit = async (data: PaymentFormFields) => {
    const valorNum = parseFloat(data.valor);
    if (!isNaN(valorNum) && valorNum > 0) {
      await onSubmit(valorNum, new Date(data.data).toISOString(), paymentType);
      reset();
    }
  };

  const handleSelectType = (tipo: PagamentoTipo) => {
    setPaymentType(tipo);
    if (tipo === 'juros' && suggestedInterest > 0) {
      setValue('valor', suggestedInterest.toFixed(2));
    } else if (tipo === 'quitacao' && principalBalance > 0) {
      setValue('valor', principalBalance.toFixed(2));
    } else {
      setValue('valor', '');
    }
  };

  const modalTitle = paymentMode === PaymentMode.JUROS_MENSAL
    ? 'Registrar Pagamento'
    : 'Adicionar Pagamento (Amortização)';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        
        {/* Payment Type Selection for JUROS_MENSAL mode */}
        {paymentMode === PaymentMode.JUROS_MENSAL && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Tipo de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectType('juros')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  paymentType === 'juros'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-dark-500 border-dark-300/30 text-gray-400 hover:border-dark-300/60'
                }`}
              >
                💰 Pagar Juros
                {suggestedInterest > 0 && (
                  <span className="block text-xs mt-0.5 opacity-70">
                    {formatCurrency(suggestedInterest)}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSelectType('quitacao')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  paymentType === 'quitacao'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-dark-500 border-dark-300/30 text-gray-400 hover:border-dark-300/60'
                }`}
              >
                ✅ Quitar Total
                {principalBalance > 0 && (
                  <span className="block text-xs mt-0.5 opacity-70">
                    {formatCurrency(principalBalance)}
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {paymentType === 'juros'
                ? 'Os juros acumulados serão pagos. O principal permanece o mesmo.'
                : 'O valor principal será quitado e a dívida será marcada como paga.'}
            </p>
          </div>
        )}

        <Input
          label="Valor do Pagamento (R$)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Ex: 500.00"
          error={errors.valor?.message}
          required
          leftIcon={<span className="text-xs font-bold text-gray-400">R$</span>}
          {...register('valor', { 
            required: 'Valor é obrigatório',
            validate: v => parseFloat(v) > 0 || 'O valor deve ser maior que zero'
          })}
        />
        <Input
          label="Data do Pagamento"
          type="datetime-local"
          error={errors.data?.message}
          required
          {...register('data', { required: 'Data é obrigatória' })}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {paymentType === 'quitacao' ? 'Quitar Dívida' : 'Confirmar Pagamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
