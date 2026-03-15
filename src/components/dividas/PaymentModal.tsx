import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

interface PaymentFormFields {
  valor: string;
  data: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (valor: number, data: string) => Promise<void>;
  loading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormFields>({
    defaultValues: {
      data: format(new Date(), "yyyy-MM-dd'T'HH:mm")
    }
  });

  const onFormSubmit = async (data: PaymentFormFields) => {
    const valorNum = parseFloat(data.valor);
    if (!isNaN(valorNum) && valorNum > 0) {
      await onSubmit(valorNum, new Date(data.data).toISOString());
      reset();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Pagamento (Amortização)">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
            Confirmar Pagamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
