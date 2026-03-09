import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Divida, DividaInput } from '../types';
import { StatusDivida } from '../types';
import { calculateCurrentValue } from '../../services/taxCalculator';

export function useAllDividas() {
  return useLiveQuery(() => db.dividas.toArray(), []);
}

export function useDividaById(id: string | undefined) {
  return useLiveQuery(() => (id ? db.dividas.get(id) : undefined), [id]);
}

export async function createDivida(input: DividaInput): Promise<string> {
  const now = new Date().toISOString();
  const valorAtual = calculateCurrentValue(
    input.valor,
    input.taxType,
    input.taxValue,
    input.dataVencimento
  );

  const divida: Divida = {
    id: uuidv4(),
    ...input,
    valorAtual,
    lembreteEnviado: null,
    createAt: now,
    updateAt: now,
  };

  await db.dividas.add(divida);
  return divida.id!;
}

export async function updateDivida(id: string, updates: Partial<DividaInput>): Promise<void> {
  const existing = await db.dividas.get(id);
  if (!existing) return;

  const merged = { ...existing, ...updates };
  const valorAtual = calculateCurrentValue(
    merged.valor,
    merged.taxType,
    merged.taxValue,
    merged.dataVencimento
  );

  await db.dividas.update(id, {
    ...updates,
    valorAtual,
    updateAt: new Date().toISOString(),
  });
}

export async function deleteDivida(id: string): Promise<void> {
  await db.dividas.delete(id);
}

export async function markReminderSent(id: string): Promise<void> {
  await db.dividas.update(id, {
    lembreteEnviado: new Date().toISOString(),
    updateAt: new Date().toISOString(),
  });
}

export async function updateAllCurrentValues(): Promise<void> {
  const all = await db.dividas.toArray();
  for (const d of all) {
    if (d.status === StatusDivida.PENDENTE || d.status === StatusDivida.VENCIDA) {
      const newVal = calculateCurrentValue(d.valor, d.taxType, d.taxValue, d.dataVencimento);
      if (newVal !== d.valorAtual) {
        await db.dividas.update(d.id!, { valorAtual: newVal, updateAt: new Date().toISOString() });
      }
    }
  }
}

export async function autoMarkOverdue(): Promise<void> {
  const now = new Date().toISOString();
  const pending = await db.dividas.where('status').equals(StatusDivida.PENDENTE).toArray();
  for (const d of pending) {
    if (d.dataVencimento < now) {
      await db.dividas.update(d.id!, {
        status: StatusDivida.VENCIDA,
        updateAt: new Date().toISOString(),
      });
    }
  }
}

export async function getDividaStats() {
  const all = await db.dividas.toArray();
  const stats = {
    total: all.length,
    totalValor: 0,
    totalValorAtual: 0,
    pendentes: 0,
    pagas: 0,
    vencidas: 0,
    canceladas: 0,
    negociando: 0,
    valorPendente: 0,
    valorPago: 0,
    valorVencido: 0,
  };

  for (const d of all) {
    stats.totalValor += d.valor;
    stats.totalValorAtual += d.valorAtual;
    switch (d.status) {
      case StatusDivida.PENDENTE:
        stats.pendentes++;
        stats.valorPendente += d.valorAtual;
        break;
      case StatusDivida.PAGA:
        stats.pagas++;
        stats.valorPago += d.valor;
        break;
      case StatusDivida.VENCIDA:
        stats.vencidas++;
        stats.valorVencido += d.valorAtual;
        break;
      case StatusDivida.CANCELADA:
        stats.canceladas++;
        break;
      case StatusDivida.NEGOCIANDO:
        stats.negociando++;
        break;
    }
  }

  return stats;
}
