import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { TaxType } from '../types';
import type { Configuracoes } from '../types';

const DEFAULT_CONFIG: Configuracoes = {
  id: 1,
  nomeEmpresa: 'Minha Empresa',
  taxaPadrao: 0,
  tipoJurosPadrao: TaxType.SEM_JUROS,
  whatsappTemplate: 'Olá {nome}, tudo bem? Passando para lembrar que a sua parcela de {valorAtual} venceu (ou vencerá) no dia {dataVencimento}.'
};

export function useConfiguracoes() {
  const config = useLiveQuery(() => db.configuracoes.get(1));
  
  // Initialize if missing (outside of useLiveQuery for safety, though Dexie usually handles this)
  // However, useLiveQuery is for reading. Let's make it more robust.
  return config;
}

// Ensure settings exist (can be called on app init)
export async function initConfiguracoes() {
  const config = await db.configuracoes.get(1);
  if (!config) {
    await db.configuracoes.put(DEFAULT_CONFIG);
  }
}

export async function updateConfiguracoes(data: Partial<Omit<Configuracoes, 'id'>>) {
  const existing = await db.configuracoes.get(1);
  if (!existing) {
    await db.configuracoes.add({ ...DEFAULT_CONFIG, ...data });
  } else {
    await db.configuracoes.update(1, data);
  }
}
