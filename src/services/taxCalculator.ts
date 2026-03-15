import { TaxType } from '../db/types';
import { differenceInDays, differenceInMonths } from 'date-fns';

/**
 * Calculates the current value of a debt based on the tax type, tax rate, and due date.
 */
export function calculateCurrentValue(
  valor: number,
  taxType: TaxType,
  taxValue: number,
  dataVencimento: string,
  pagamentos: { data: string; valor: number }[] = []
): number {
  const now = new Date();
  const taxRate = taxValue / 100;
  
  // Sort payments by date ascending
  const sortedPayments = [...pagamentos]
    .map(p => ({ ...p, date: new Date(p.data) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let currentPrincipal = valor;
  let lastCalcDate = new Date(dataVencimento); // Intially start applying interests from the due date

  const calculateInterestChunk = (principal: number, startDate: Date, endDate: Date) => {
    if (principal <= 0) return 0; // No interest on negative or paid-off balances
    if (startDate >= endDate) return 0;
    
    switch (taxType) {
      case TaxType.SEM_JUROS:
        return 0;
      case TaxType.JUROS_FIXO: {
        const days = differenceInDays(endDate, startDate);
        const months = days / 30; // 30-day commercial month
        return principal * taxRate * months;
      }
      case TaxType.SIMPLES: {
        const days = differenceInDays(endDate, startDate);
        const years = days / 365;
        return principal * taxRate * years;
      }
      case TaxType.COMPOSTA: {
        const months = differenceInMonths(endDate, startDate);
        // Note: exact compound interest usually interpolates fractional months or just takes whole months.
        // We'll use fractional months for a more exact continuous-like partial payment.
        // Or we can use exact difference in months as a float (approx):
        const days = differenceInDays(endDate, startDate);
        const fractionalMonths = days / (365.25 / 12);
        return principal * Math.pow(1 + taxRate, fractionalMonths) - principal;
      }
      default:
        return 0;
    }
  };

  for (const p of sortedPayments) {
    // If the payment is before the due date, we don't apply interest yet.
    if (p.date < lastCalcDate) {
      currentPrincipal -= p.valor;
      continue;
    }

    // Calculate interest accumulated from last calc date up to this payment date
    const interest = calculateInterestChunk(currentPrincipal, lastCalcDate, p.date);
    
    // The payment pays off accumulated interest + principal
    currentPrincipal = currentPrincipal + interest - p.valor;
    lastCalcDate = p.date; // advance the timeline
  }

  // Calculate remaining interest from the last payment up to "now"
  if (lastCalcDate < now) {
    const finalInterest = calculateInterestChunk(currentPrincipal, lastCalcDate, now);
    currentPrincipal += finalInterest;
  }

  return currentPrincipal;
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

