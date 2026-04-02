import { addMonths, setDate, parseISO, format, isBefore } from 'date-fns';
import { Parcela, StatusParcela } from '../db/types';

/**
 * Calcula as parcelas de uma compra baseada no fechamento do cartão.
 * 
 * Regra:
 * - Se a data da compra for ANTES do dia de fechamento, a 1ª parcela vence no mês atual.
 * - Se a data da compra for IGUAL ou DEPOIS do dia de fechamento, a 1ª parcela vence no próximo mês.
 */
export function calcularParcelas(
  valorTotal: number,
  quantidadeParcelas: number,
  dataCompraStr: string,
  diaFechamento: number,
  diaVencimento: number
): Omit<Parcela, 'compraId'>[] {
  const dataCompra = parseISO(dataCompraStr);
  const parcelas: Omit<Parcela, 'compraId'>[] = [];
  const valorParcela = Number((valorTotal / quantidadeParcelas).toFixed(2));
  
  // Ajuste para a última parcela não perder centavos por arredondamento
  const DiferencaArredondamento = Number((valorTotal - (valorParcela * quantidadeParcelas)).toFixed(2));

  // Determinar o mês da primeira parcela
  let dataPrimeiroVencimento = setDate(dataCompra, diaVencimento);
  
  // Se a compra foi feita no dia de fechamento ou depois, joga para o próximo mês
  if (dataCompra.getDate() >= diaFechamento) {
    dataPrimeiroVencimento = addMonths(dataPrimeiroVencimento, 1);
  }

  for (let i = 1; i <= quantidadeParcelas; i++) {
    const dataVenc = addMonths(dataPrimeiroVencimento, i - 1);
    
    parcelas.push({
      numeroParcela: i,
      valor: i === quantidadeParcelas ? Number((valorParcela + DiferencaArredondamento).toFixed(2)) : valorParcela,
      dataVencimento: format(dataVenc, 'yyyy-MM-dd'),
      status: StatusParcela.PENDENTE
    });
  }

  return parcelas;
}
