import { useState, useEffect } from 'react';
import { TaxType, PaymentMode } from '../types';
import type { Configuracoes } from '../types';

const DEFAULT_CONFIG: Configuracoes = {
  id: 1,
  nomeEmpresa: 'Minha Empresa',
  taxaPadrao: 0,
  tipoJurosPadrao: TaxType.SEM_JUROS,
  paymentModePadrao: PaymentMode.PARCELADO,
  whatsappTemplate: 'Olá {nome}, tudo bem? Passando para lembrar que a sua parcela de {valorAtual} venceu (ou vencerá) no dia {dataVencimento}.'
};

const STORAGE_KEY = '@app_config';

export function useConfiguracoes() {
  const [config, setConfig] = useState<Configuracoes>(DEFAULT_CONFIG);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setConfig(JSON.parse(stored));
        } catch(e) {}
      }
    };
    load();
    // Escuta evento custom para atualizar reactivamente
    window.addEventListener('app_config_updated', load);
    return () => window.removeEventListener('app_config_updated', load);
  }, []);

  return config;
}

export async function initConfiguracoes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
  }
}

export async function updateConfiguracoes(data: Partial<Omit<Configuracoes, 'id'>>) {
  const stored = localStorage.getItem(STORAGE_KEY);
  let current = DEFAULT_CONFIG;
  if (stored) {
    try {
      current = JSON.parse(stored);
    } catch(e) {}
  }
  const updated = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('app_config_updated'));
}
