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
    input.dataVencimento,
    []
  );

  const divida: Divida = {
    id: uuidv4(),
    ...input,
    valorAtual,
    lembreteEnviado: null,
    pagamentos: [],
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
  const pagamentos = merged.pagamentos || [];
  const valorAtual = calculateCurrentValue(
    merged.valor,
    merged.taxType,
    merged.taxValue,
    merged.dataVencimento,
    pagamentos
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

export async function addPagamento(dividaId: string, valor: number, data: string): Promise<void> {
  const divida = await db.dividas.get(dividaId);
  if (!divida) throw new Error('Dívida não encontrada');

  const novoPagamento = { id: uuidv4(), valor, data };
  const pagamentos = [...(divida.pagamentos || []), novoPagamento];
  
  const novoValorAtual = calculateCurrentValue(
    divida.valor,
    divida.taxType,
    divida.taxValue,
    divida.dataVencimento,
    pagamentos
  );

  await db.dividas.update(dividaId, {
    pagamentos,
    valorAtual: novoValorAtual,
    updateAt: new Date().toISOString()
  });
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
      const newVal = calculateCurrentValue(d.valor, d.taxType, d.taxValue, d.dataVencimento, d.pagamentos || []);
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
    
    // Sum partial payments
    const totalAmortizado = d.pagamentos?.reduce((acc, p) => acc + p.valor, 0) || 0;
    stats.valorPago += totalAmortizado;

    switch (d.status) {
      case StatusDivida.PENDENTE:
        stats.pendentes++;
        stats.valorPendente += d.valorAtual;
        break;
      case StatusDivida.PAGA:
        stats.pagas++;
        // If it was marked as paid without using the partial payment system:
        if (totalAmortizado === 0) {
          stats.valorPago += d.valor;
        }
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
