import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { useConfiguracoes, updateConfiguracoes } from '../db/hooks/useConfiguracoes';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { TaxType, TAX_TYPE_LABELS, PaymentMode, PAYMENT_MODE_LABELS } from '../db/types';
import { toast } from 'sonner';

interface SettingsForm {
  nomeEmpresa: string;
  tipoJurosPadrao: string;
  taxaPadrao: string;
  paymentModePadrao: string;
  whatsappTemplate: string;
}

const taxTypeOptions = Object.entries(TAX_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const paymentModeOptions = Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => ({ value, label }));

export const SettingsPage: React.FC = () => {
  const config = useConfiguracoes();
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<SettingsForm>();

  useEffect(() => {
    if (config) {
      reset({
        nomeEmpresa: config.nomeEmpresa,
        tipoJurosPadrao: config.tipoJurosPadrao,
        taxaPadrao: String(config.taxaPadrao),
        paymentModePadrao: config.paymentModePadrao || PaymentMode.PARCELADO,
        whatsappTemplate: config.whatsappTemplate,
      });
    }
  }, [config, reset]);

  const watchedTaxType = watch('tipoJurosPadrao');

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateConfiguracoes({
        nomeEmpresa: data.nomeEmpresa,
        tipoJurosPadrao: data.tipoJurosPadrao as TaxType,
        taxaPadrao: parseFloat(data.taxaPadrao) || 0,
        paymentModePadrao: data.paymentModePadrao as PaymentMode,
        whatsappTemplate: data.whatsappTemplate,
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar as configurações.');
    }
  };

  if (!config) {
    return (
      <Layout>
        <Topbar title="Configurações" />
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Topbar
        title="Configurações"
        subtitle="Preferências globais da sua empresa"
      />

      <div className="p-4 lg:p-6 max-w-2xl animate-fade-in">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-dark-600 border border-dark-300/50 rounded-2xl p-6 shadow-card space-y-6">
          
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Dados do Negócio
            </h3>
            <Input
              label="Nome da Empresa / Credor"
              {...register('nomeEmpresa', { required: 'Obrigatório' })}
            />
          </div>

          <div className="pt-4 border-t border-dark-400">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Padrões para Novas Dívidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Juros Padrão"
                options={taxTypeOptions}
                {...register('tipoJurosPadrao')}
              />
              <Input
                label="Taxa de Juros Padrão (%)"
                type="number"
                step="0.01"
                min="0"
                disabled={watchedTaxType === TaxType.SEM_JUROS}
                {...register('taxaPadrao')}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Esses valores virão preenchidos automaticamente ao criar uma "Nova Dívida".
            </p>
          </div>

          <div className="pt-4 border-t border-dark-400">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Modo de Pagamento Padrão
            </h3>
            <Select
              label="Como os pagamentos são aplicados"
              options={paymentModeOptions}
              {...register('paymentModePadrao')}
            />
            <div className="mt-3 p-3 bg-dark-500/50 rounded-lg border border-dark-300/30">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-primary-300">Juros Mensal:</strong> O devedor paga somente os juros por mês. O valor principal (montante) é pago de uma vez na quitação.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">
                <strong className="text-primary-300">Parcelado:</strong> Os pagamentos são descontados do valor total (juros + principal), como amortização.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-400">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Template de Cobrança (WhatsApp)
            </h3>
            <Textarea
              label="Mensagem Padrão"
              rows={4}
              {...register('whatsappTemplate')}
            />
            <div className="mt-2 text-xs text-gray-400">
              Variáveis dinâmicas que você pode usar no texto:
              <ul className="list-none mt-1 space-y-1">
                <li><code className="text-primary-300 bg-primary-900/30 px-1 rounded">{'{nome}'}</code> - Nome do Cliente</li>
                <li><code className="text-primary-300 bg-primary-900/30 px-1 rounded">{'{valorAtual}'}</code> - Valor atualizado (com juros)</li>
                <li><code className="text-primary-300 bg-primary-900/30 px-1 rounded">{'{dataVencimento}'}</code> - Data combinada via sistema</li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
              Salvar Configurações
            </Button>
          </div>

        </form>
      </div>
    </Layout>
  );
};
