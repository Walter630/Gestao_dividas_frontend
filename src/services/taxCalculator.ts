import { TaxType, PaymentMode } from '../db/types';
import type { PagamentoTipo } from '../db/types';
import { differenceInMonths, differenceInDays } from 'date-fns';

/**
 * Internal: Calculates the interest amount on a principal over a time period for a given tax type.
 * Synchronized with Backend Java logic: valueOriginal * taxRate * months.
 */
function calculateInterestChunk(
  principal: number,
  taxType: TaxType,
  taxRate: number,
  startDate: Date,
  endDate: Date
): number {
  if (principal <= 0) return 0;
  if (startDate >= endDate) return 0;

  // Utiliza a diferença em dias e divide por 30 para permitir juros proporcionais (quebrados)
  const days = differenceInDays(endDate, startDate);
  const months = Math.max(0, days / 30.0);
  
  switch (taxType) {
    case TaxType.SEM_JUROS:
      return 0;
    case TaxType.JUROS_FIXO:
    case TaxType.SIMPLES: {
      // principal * rate * months
      return principal * taxRate * months;
    }
    case TaxType.COMPOSTA: {
      // principal * (1 + rate)^months - principal
      return principal * Math.pow(1 + taxRate, months) - principal;
    }
    default:
      return 0;
  }
}

export interface DebtBreakdown {
  /** The original principal (valor original) */
  principal: number;
  /** Total interest accumulated to date */
  jurosAcumulados: number;
  /** Interest already paid (sum of 'juros' payments) */
  jurosPagos: number;
  /** Principal already paid (sum of 'parcela'/'quitacao' payments, or amortizations) */
  principalPago: number;
  /** Total paid (all payments combined) */
  totalPago: number;
  /** Remaining principal balance */
  saldoPrincipal: number;
  /** Remaining interest balance (accumulated - paid) */
  jurosPendentes: number;
  /** Current total value owed (saldoPrincipal + jurosPendentes) */
  valorAtual: number;
}

/**
 * Calculates a full breakdown of a debt, respecting the payment mode.
 */
export function calculateDebtBreakdown(
  valor: number,
  taxType: TaxType,
  taxValue: number,
  dataCriacao: string,
  paymentMode: PaymentMode,
  pagamentos: { data: string; valor: number; tipo?: PagamentoTipo }[] = []
): DebtBreakdown {
  const now = new Date();
  const taxRate = taxValue / 100;
  const birthDate = new Date(dataCriacao);

  const sortedPayments = [...pagamentos]
    .map(p => ({ ...p, date: new Date(p.data), tipo: p.tipo || 'parcela' as PagamentoTipo }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (paymentMode === PaymentMode.JUROS_MENSAL) {
    // Interest is calculated ONCE from birthDate to now on ORIGINAL valor
    let totalJurosPagos = 0;
    let totalPrincipalPago = 0;

    for (const p of sortedPayments) {
      if (p.tipo === 'juros') {
        totalJurosPagos += p.valor;
      } else {
        totalPrincipalPago += p.valor;
      }
    }

    const jurosAcumulados = calculateInterestChunk(valor, taxType, taxRate, birthDate, now);
    const jurosPendentes = Math.max(0, jurosAcumulados - totalJurosPagos);
    const saldoPrincipal = Math.max(0, valor - totalPrincipalPago);
    const totalPago = totalJurosPagos + totalPrincipalPago;
    const valorAtual = saldoPrincipal + jurosPendentes;

    return {
      principal: valor,
      jurosAcumulados,
      jurosPagos: totalJurosPagos,
      principalPago: totalPrincipalPago,
      totalPago,
      saldoPrincipal,
      jurosPendentes,
      valorAtual,
    };
  } else {
    // PARCELADO (Amortization) - Same monthly logic
    let currentPrincipal = valor;
    let lastCalcDate = birthDate;
    let totalInterestAccrued = 0;
    let totalPaid = 0;

    for (const p of sortedPayments) {
      totalPaid += p.valor;
      if (p.date < lastCalcDate) {
        currentPrincipal -= p.valor;
        continue;
      }
      const interest = calculateInterestChunk(currentPrincipal, taxType, taxRate, lastCalcDate, p.date);
      totalInterestAccrued += interest;
      currentPrincipal = currentPrincipal + interest - p.valor;
      lastCalcDate = p.date;
    }

    if (lastCalcDate < now) {
      const finalInterest = calculateInterestChunk(currentPrincipal, taxType, taxRate, lastCalcDate, now);
      totalInterestAccrued += finalInterest;
      currentPrincipal += finalInterest;
    }

    return {
      principal: valor,
      jurosAcumulados: totalInterestAccrued,
      jurosPagos: 0,
      principalPago: totalPaid,
      totalPago: totalPaid,
      saldoPrincipal: Math.max(0, currentPrincipal),
      jurosPendentes: 0,
      valorAtual: Math.max(0, currentPrincipal),
    };
  }
}

export function calculateCurrentValue(
  valor: number,
  taxType: TaxType,
  taxValue: number,
  dataCriacao: string,
  pagamentos: { data: string; valor: number; tipo?: PagamentoTipo }[] = [],
  paymentMode: PaymentMode = PaymentMode.PARCELADO
): number {
  const breakdown = calculateDebtBreakdown(valor, taxType, taxValue, dataCriacao, paymentMode, pagamentos);
  return breakdown.valorAtual;
}

export function calculateMonthlyInterest(
  valor: number,
  taxType: TaxType,
  taxValue: number
): number {
  const taxRate = taxValue / 100;
  // Predict 1 month of interest
  const months = 1;
  if (taxType === TaxType.COMPOSTA) {
    return valor * Math.pow(1 + taxRate, months) - valor;
  }
  return valor * taxRate * months;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
