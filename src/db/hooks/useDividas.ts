import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Divida, DividaInput, PagamentoTipo } from '../types';
import { StatusDivida, PaymentMode } from '../types';
import { calculateCurrentValue, calculateDebtBreakdown } from '../../services/taxCalculator';

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
    [],
    input.paymentMode
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
    pagamentos,
    merged.paymentMode
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

export async function addPagamento(
  dividaId: string,
  valor: number,
  data: string,
  tipo: PagamentoTipo = 'parcela'
): Promise<void> {
  const divida = await db.dividas.get(dividaId);
  if (!divida) throw new Error('Dívida não encontrada');

  const novoPagamento = { id: uuidv4(), valor, data, tipo };
  const pagamentos = [...(divida.pagamentos || []), novoPagamento];
  
  const novoValorAtual = calculateCurrentValue(
    divida.valor,
    divida.taxType,
    divida.taxValue,
    divida.dataVencimento,
    pagamentos,
    divida.paymentMode
  );

  const updates: Partial<Divida> = {
    pagamentos,
    valorAtual: novoValorAtual,
    updateAt: new Date().toISOString(),
  };

  // If it's a quitacao payment, mark the debt as paid
  if (tipo === 'quitacao') {
    updates.status = StatusDivida.PAGA;
  }

  await db.dividas.update(dividaId, updates);
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
      const newVal = calculateCurrentValue(
        d.valor, d.taxType, d.taxValue, d.dataVencimento,
        d.pagamentos || [], d.paymentMode
      );
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
    totalEmprestado: 0,
    jurosAcumulados: 0,
    jurosPendentes: 0,
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
    
    // Calculate breakdown for each debt
    const breakdown = calculateDebtBreakdown(
      d.valor, d.taxType, d.taxValue, d.dataVencimento,
      d.paymentMode || PaymentMode.PARCELADO,
      d.pagamentos || []
    );

    // Sum partial payments
    const totalAmortizado = d.pagamentos?.reduce((acc, p) => acc + p.valor, 0) || 0;
    stats.valorPago += totalAmortizado;

    // Accumulate interest stats for active debts
    if (d.status !== StatusDivida.PAGA && d.status !== StatusDivida.CANCELADA) {
      stats.totalEmprestado += d.valor;
      stats.jurosAcumulados += breakdown.jurosAcumulados;
      stats.jurosPendentes += breakdown.jurosPendentes;
    }

    switch (d.status) {
      case StatusDivida.PENDENTE:
        stats.pendentes++;
        stats.valorPendente += breakdown.jurosAcumulados > 0
          ? breakdown.jurosPendentes
          : d.valorAtual;
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
