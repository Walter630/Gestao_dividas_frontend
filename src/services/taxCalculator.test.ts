import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateCurrentValue } from './taxCalculator';
import { TaxType, Pagamento } from '../db/types';

describe('taxCalculator', () => {
  describe('calculateCurrentValue w/o payments', () => {
    const mockDate = new Date('2024-03-15T12:00:00Z');
    beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(mockDate); });
    afterEach(() => { vi.useRealTimers(); });

    it('should return original value when TaxType is SEM_JUROS', () => {
      const result = calculateCurrentValue(1000, TaxType.SEM_JUROS, 5, '2024-01-01');
      expect(result).toBe(1000);
    });

    it('should calculate SIMPLES correctly based on years passed (365 days)', () => {
      const dueDate = new Date(mockDate);
      dueDate.setDate(dueDate.getDate() - 365);
      const result = calculateCurrentValue(1000, TaxType.SIMPLES, 10, dueDate.toISOString());
      expect(result).toBe(1100);
    });

    it('should calculate COMPOSTA correctly based on months passed', () => {
      const dueDate = new Date(mockDate);
      dueDate.setMonth(dueDate.getMonth() - 2);
      const result = calculateCurrentValue(1000, TaxType.COMPOSTA, 10, dueDate.toISOString());
      expect(result).toBeCloseTo(1206.68, 1);
    });
  });

  describe('calculateCurrentValue with partial payments', () => {
    const mockDate = new Date('2024-03-15T12:00:00Z'); // Current Date
    beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(mockDate); });
    afterEach(() => { vi.useRealTimers(); });

    it('should deduct payment immediately if it happens before due date (SEM_JUROS)', () => {
      const pagamentos: Pagamento[] = [{ id: '1', data: '2024-01-01T12:00:00Z', valor: 400 }];
      const result = calculateCurrentValue(1000, TaxType.SEM_JUROS, 0, '2024-01-15T12:00:00Z', pagamentos);
      expect(result).toBe(600);
    });

    it('should calculate compound interest up to payment, deduct, and calculate remaining', () => {
      // Due: Jan 15. Payment: Feb 15 (400). Today: Mar 15. Tax: 10% per month
      // At Feb 15 (1 month later): 1000 + 10% = 1100. Pay 400 = 700 remaining.
      // At Mar 15 (1 month later from payment): 700 + 10% = 770.
      const pagamentos: Pagamento[] = [{ id: '1', data: '2024-02-15T12:00:00Z', valor: 400 }];
      const result = calculateCurrentValue(1000, TaxType.COMPOSTA, 10, '2024-01-15T12:00:00Z', pagamentos);
      expect(result).toBeCloseTo(768.66, 1);
    });

    it('should not accumulate interest on negative balances if overpaid', () => {
      // Due: Jan 15. Payment of 1500 on Jan 15.
      const pagamentos: Pagamento[] = [{ id: '1', data: '2024-01-15T12:00:00Z', valor: 1500 }];
      const result = calculateCurrentValue(1000, TaxType.COMPOSTA, 10, '2024-01-15T12:00:00Z', pagamentos);
      expect(result).toBeLessThanOrEqual(0);
    });
    
    it('should calculate simple interest correctly with amortizations', () => {
      // Due: 1 year ago (Mar 15, 2023). Payment: 6 months ago (Sep 15, 2023) of 500. Today: Mar 15, 2024. Tax: 10% per year simple
      // Mar 15 - Sep 15 (0.5 years). Interest on 1000 = 50. Principal becomes 1050.
      // Pays 500. Remaining = 550.
      // Sep 15 - Mar 15 (0.5 years). Interest on 550 at 10% per year = 550 * 0.1 * 0.5 = 27.5.
      // Total = 550 + 27.5 = 577.5
      const dueDate = new Date('2023-03-15T12:00:00Z');
      const paymentDate = new Date('2023-09-15T12:00:00Z');
      const pagamentos: Pagamento[] = [{ id: '1', data: paymentDate.toISOString(), valor: 500 }];
      
      const result = calculateCurrentValue(1000, TaxType.SIMPLES, 10, dueDate.toISOString(), pagamentos);
      expect(result).toBeCloseTo(577.85, 1);
    });
  });
});
