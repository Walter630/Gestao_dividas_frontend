import { TaxType, PaymentMode } from '../db/types';
import type { PagamentoTipo } from '../db/types';
import { differenceInDays, differenceInMonths } from 'date-fns';

/**
 * Internal: Calculates the interest amount on a principal over a time period for a given tax type.
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

  switch (taxType) {
    case TaxType.SEM_JUROS:
      return 0;
    case TaxType.JUROS_FIXO: {
      const days = differenceInDays(endDate, startDate);
      const months = days / 30;
      return principal * taxRate * months;
    }
    case TaxType.SIMPLES: {
      const days = differenceInDays(endDate, startDate);
      const years = days / 365;
      return principal * taxRate * years;
    }
    case TaxType.COMPOSTA: {
      const days = differenceInDays(endDate, startDate);
      const fractionalMonths = days / (365.25 / 12);
      return principal * Math.pow(1 + taxRate, fractionalMonths) - principal;
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
  dataVencimento: string,
  paymentMode: PaymentMode,
  pagamentos: { data: string; valor: number; tipo?: PagamentoTipo }[] = []
): DebtBreakdown {
  const now = new Date();
  const taxRate = taxValue / 100;

  const sortedPayments = [...pagamentos]
    .map(p => ({ ...p, date: new Date(p.data), tipo: p.tipo || 'parcela' as PagamentoTipo }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (paymentMode === PaymentMode.JUROS_MENSAL) {
    // JUROS_MENSAL: Interest is always calculated on the ORIGINAL principal.
    // Interest payments do NOT reduce the principal.
    // Principal is paid in full when "quitacao" is done.
    let totalJurosPagos = 0;
    let totalPrincipalPago = 0;

    for (const p of sortedPayments) {
      if (p.tipo === 'juros') {
        totalJurosPagos += p.valor;
      } else {
        // parcela or quitacao
        totalPrincipalPago += p.valor;
      }
    }

    const saldoPrincipal = Math.max(0, valor - totalPrincipalPago);
    const dueDate = new Date(dataVencimento);
    const startDate = dueDate < now ? dueDate : now;
    const endDate = now;

    // Calculate total interest from due date to now on ORIGINAL valor
    const jurosAcumulados = startDate < endDate
      ? calculateInterestChunk(valor, taxType, taxRate, startDate, endDate)
      : 0;
    
    const jurosPendentes = Math.max(0, jurosAcumulados - totalJurosPagos);
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
    // PARCELADO: Amortization mode — payments reduce (principal + interest) combined.
    let currentPrincipal = valor;
    let lastCalcDate = new Date(dataVencimento);
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

    const saldoPrincipal = Math.max(0, valor - totalPaid + totalInterestAccrued);

    return {
      principal: valor,
      jurosAcumulados: totalInterestAccrued,
      jurosPagos: 0, // In amortization mode, payments cover both interest and principal combined
      principalPago: totalPaid,
      totalPago: totalPaid,
      saldoPrincipal: Math.max(0, currentPrincipal),
      jurosPendentes: 0,
      valorAtual: Math.max(0, currentPrincipal),
    };
  }
}

/**
 * Calculates the current value of a debt based on the tax type, tax rate, due date, and payment mode.
 * This is a simplified wrapper around calculateDebtBreakdown.
 */
export function calculateCurrentValue(
  valor: number,
  taxType: TaxType,
  taxValue: number,
  dataVencimento: string,
  pagamentos: { data: string; valor: number; tipo?: PagamentoTipo }[] = [],
  paymentMode: PaymentMode = PaymentMode.PARCELADO
): number {
  const breakdown = calculateDebtBreakdown(valor, taxType, taxValue, dataVencimento, paymentMode, pagamentos);
  return breakdown.valorAtual;
}

/**
 * Calculates the current month's interest for a JUROS_MENSAL debt.
 * Used to pre-fill the payment modal.
 */
export function calculateMonthlyInterest(
  valor: number,
  taxType: TaxType,
  taxValue: number
): number {
  const taxRate = taxValue / 100;
  // Calculate interest for exactly 1 month (30 days)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  return calculateInterestChunk(valor, taxType, taxRate, startDate, endDate);
}

/**
 * Formats a number as BRL currency string.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats a date string to a localized date string.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formats a date string to a localized datetime string.
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

