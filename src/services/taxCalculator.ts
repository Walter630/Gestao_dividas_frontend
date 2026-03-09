import { TaxType } from '../db/types';
import { differenceInDays, differenceInMonths } from 'date-fns';

/**
 * Calculates the current value of a debt based on the tax type, tax rate, and due date.
 */
export function calculateCurrentValue(
  valor: number,
  taxType: TaxType,
  taxValue: number,
  dataVencimento: string
): number {
  const now = new Date();
  const dueDate = new Date(dataVencimento);
  const taxRate = taxValue / 100;

  switch (taxType) {
    case TaxType.SEM_JUROS:
      return valor;

    case TaxType.JUROS_FIXO: {
      // Fixed monthly interest applied once the debt is overdue
      const months = Math.max(0, differenceInMonths(now, dueDate));
      return valor + valor * taxRate * months;
    }

    case TaxType.SIMPLES: {
      // Simple interest: principal * rate * time (in days / 365)
      const days = Math.max(0, differenceInDays(now, dueDate));
      const years = days / 365;
      return valor + valor * taxRate * years;
    }

    case TaxType.COMPOSTA: {
      // Compound interest: principal * (1 + rate)^time (in months)
      const months = Math.max(0, differenceInMonths(now, dueDate));
      return valor * Math.pow(1 + taxRate, months);
    }

    default:
      return valor;
  }
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

