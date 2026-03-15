import React from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Cliente } from '../../db/types';

interface ClientFormProps {
  defaultValues?: Partial<Cliente>;
  onSubmit: (data: Omit<Cliente, 'id' | 'createAt'>) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Salvar Cliente',
}) => {
  const { register, handleSubmit, formState: { errors } } = useRHForm<Omit<Cliente, 'id' | 'createAt'>>({
    defaultValues: {
      nome: defaultValues?.nome || '',
      email: defaultValues?.email || '',
      telefone: defaultValues?.telefone || '',
      documento: defaultValues?.documento || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nome Completo *"
        placeholder="Ex: João da Silva"
        error={errors.nome?.message}
        {...register('nome', { required: 'Nome é obrigatório' })}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="joao@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Telefone (WhatsApp)"
          placeholder="Ex: 5511999999999"
          error={errors.telefone?.message}
          {...register('telefone')}
        />
      </div>
      <Input
        label="CPF / CNPJ"
        placeholder="Ex: 123.456.789-00"
        error={errors.documento?.message}
        {...register('documento')}
      />

      <div className="pt-4 border-t border-dark-400">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
