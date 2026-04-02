import { describe, test, expect } from 'vitest';
import { calcularParcelas } from './installmentUtils';

describe('calcularParcelas', () => {
  test('Compra antes do fechamento: 1ª parcela no mês atual', () => {
    // Fechamento: 10 / Vencimento: 20
    // Compra: 05 de Abril
    const parcelas = calcularParcelas(100, 2, '2026-04-05', 10, 20);
    
    expect(parcelas[0].dataVencimento).toBe('2026-04-20');
    expect(parcelas[1].dataVencimento).toBe('2026-05-20');
  });

  test('Compra após o fechamento: 1ª parcela no próximo mês', () => {
    // Fechamento: 10 / Vencimento: 20
    // Compra: 12 de Abril
    const parcelas = calcularParcelas(100, 2, '2026-04-12', 10, 20);
    
    expect(parcelas[0].dataVencimento).toBe('2026-05-20');
    expect(parcelas[1].dataVencimento).toBe('2026-06-20');
  });

  test('Compra no dia do fechamento: 1ª parcela no próximo mês', () => {
    // Fechamento: 10 / Vencimento: 20
    // Compra: 10 de Abril
    const parcelas = calcularParcelas(100, 2, '2026-04-10', 10, 20);
    
    expect(parcelas[0].dataVencimento).toBe('2026-05-20');
  });

  test('Divisão exata de valores com ajuste de centavos', () => {
    // 100 / 3 = 33.33 + 33.33 + 33.34
    const parcelas = calcularParcelas(100, 3, '2026-04-01', 10, 20);
    
    expect(parcelas[0].valor).toBe(33.33);
    expect(parcelas[1].valor).toBe(33.33);
    expect(parcelas[2].valor).toBe(33.34);
  });
});
