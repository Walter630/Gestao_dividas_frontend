import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import type { Divida, DividaInput, PagamentoTipo } from '../types';
import { StatusDivida, PaymentMode, TaxType } from '../types';
import { calculateDebtBreakdown } from '../../services/taxCalculator';
import { differenceInDays } from 'date-fns';

// ----------------------------------------------------
// Custom Hooks for the Frontend React Comps
// ----------------------------------------------------

/**
 * Determines the correct status for a debt based on payments and due date.
 * - If fully paid, returns PAGA
 * - If past due date and not paid, returns VENCIDA
 * - Otherwise returns the original status (PENDENTE, NEGOCIANDO, CANCELADA)
 */
function determineDebtStatus(
  status: any,
  dataVencimento: string,
  valorAtual: number,
  pagamentos: { data: string; valor: number; tipo: string }[]
): StatusDivida {
  const s = String(status).toUpperCase();
  
  // Se veio do Java como PAGO
  if (s === 'PAGA' || s === 'PAGO') {
    return StatusDivida.PAGO;
  }
  if (s === 'CANCELADA') {
    return StatusDivida.CANCELADA;
  }
  if (s === 'NEGOCIANDO') {
    return StatusDivida.NEGOCIANDO;
  }

  // Check if debt is fully paid
  if (valorAtual <= 0) {
    return StatusDivida.PAGO;
  }

  // Se veio do Java como ATRASADO
  if (s === 'ATRASADO' || s === 'VENCIDA') {
    return StatusDivida.ATRASADO;
  }

  // Check se data de vencimento passou
  if (dataVencimento) {
    const daysUntilDue = differenceInDays(new Date(dataVencimento), new Date());
    if (daysUntilDue < 0) {
      return StatusDivida.ATRASADO;
    }
  }

  return StatusDivida.PENDENTE;
}

export function useAllDividas() {
  const [dividas, setDividas] = useState<Divida[] | undefined>(undefined);

  const fetchDividas = useCallback(async () => {
    try {
      const response = await api.get('/debts');

      const backendArray = await Promise.all(response.data.map(async (d: any) => {
        const valorOriginal = Number(d.valorOriginal || d.valor || 0);
        let pagamentos = (d.payments || d.pagamentos || []).map((p: any) => ({
          id: p.id,
          data: p.paymentDate || p.data || new Date().toISOString(),
          valor: Number(p.valuePrincipal || 0) + Number(p.taxValue || 0) || Number(p.valor || 0),
          tipo: (p.paymentType?.toLowerCase()) || (p.tipo) || 'parcela'
        }));

        // Dynamically fetch breakdown for each debt since DebtResponseDTO doesn't include it
        let apiBreakdown: any = null;
        try {
          const bdRes = await api.get(`/debts/${d.id}/breakdown`);
          apiBreakdown = bdRes.data;
        } catch (e) {
          console.warn(`Breakdown error for debt ${d.id}`);
        }

        const breakdown = apiBreakdown ? {
          valorOriginal: Number(apiBreakdown.valorOriginal || 0),
          jurosAcumulados: Number(apiBreakdown.jurosAcumulados || 0),
          jurosPagos: Number(apiBreakdown.totalJurosPagos || 0),
          principalPago: Number(apiBreakdown.totalPrincipalPago || 0),
          saldoPrincipal: Number(apiBreakdown.saldoPrincipal || 0),
          jurosPendentes: Number(apiBreakdown.jurosPendentes || 0),
          totalPago: Number(apiBreakdown.totalJurosPagos || 0) + Number(apiBreakdown.totalPrincipalPago || 0),
          valorAtual: Number(apiBreakdown.saldoPrincipal || 0) + Number(apiBreakdown.jurosPendentes || 0),
          principal: Number(apiBreakdown.valorOriginal || 0)
        } : calculateDebtBreakdown(
          valorOriginal,
          d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
          Number(d.taxJuros || 0) * 100,
          d.dataVencimento || d.createAt || d.createdAt,
          d.taxType || PaymentMode.PARCELADO,
          pagamentos
        );

        // Determine status automatically
        const calculatedStatus = determineDebtStatus(
          d.status || StatusDivida.PENDENTE,
          d.dataVencimento,
          breakdown.valorAtual,
          pagamentos
        );

        return {
          id: String(d.id),
          clienteId: String(d.cliente?.id || d.clienteId || d.clientId),
          devedorNome: d.cliente?.nome || d.name || d.clienteNome || d.clientName || 'Cliente',
          valor: valorOriginal,
          descricao: d.descricao || d.descrição,
          dataVencimento: d.dataVencimento,
          taxType: d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
          taxValue: Number(d.taxJuros || d.taxaJuros || 0) * 100,
          numeroParcelas: d.numeroParcelas || 1,
          paymentMode: d.taxType || d.paymentMode || PaymentMode.PARCELADO,
          status: calculatedStatus,
          valorAtual: Number(breakdown.valorAtual || 0),
          pagamentos,
          breakdown, // Expose breakdown to table directly
          lembreteEnviado: d.lembreteEnviado || null,
          createAt: d.createAt || d.createdAt || new Date().toISOString(),
          updateAt: d.updateAt || d.updatedAt || d.createAt || d.createdAt,
        };
      }));

      setDividas(backendArray);
    } catch (error) {
      console.error('Falha ao buscar dividas', error);
      setDividas([]);
    }
  }, []);

  useEffect(() => {
    fetchDividas();
  }, [fetchDividas]);

  return dividas;
}

export function useDividaById(id: string | undefined) {
  const [divida, setDivida] = useState<Divida | undefined>(undefined);

  const fetchDivida = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(`/debts/${id}`);
      const d = response.data;

      const valorOriginal = Number(d.valorOriginal || d.valor || 0);
      const pagamentos = (d.payments || d.pagamentos || []).map((p: any) => ({
        id: p.id,
        data: p.paymentDate || p.data || new Date().toISOString(),
        valor: Number(p.valuePrincipal || 0) + Number(p.taxValue || 0) || Number(p.valor || 0),
        tipo: (p.paymentType?.toLowerCase()) || (p.tipo) || 'parcela'
      }));

      // Calculate breakdown to get accurate valorAtual
      const breakdown = calculateDebtBreakdown(
        valorOriginal,
        d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
        Number(d.taxJuros || 0) * 100,
        d.dataVencimento || d.createAt || d.createdAt,
        d.taxType || PaymentMode.PARCELADO,
        pagamentos
      );

      // Determine status automatically
      const calculatedStatus = determineDebtStatus(
        d.status || StatusDivida.PENDENTE,
        d.dataVencimento,
        breakdown.valorAtual,
        pagamentos
      );

      const mD: Divida = {
        id: String(d.id),
        clienteId: String(d.cliente?.id || d.clienteId || d.clientId),
        devedorNome: d.cliente?.nome || d.name || d.clienteNome || 'Cliente',
        valor: valorOriginal,
        descricao: d.descricao || d.descrição,
        dataVencimento: d.dataVencimento,
        taxType: d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
        taxValue: Number(d.taxJuros || d.taxaJuros || 0) * 100,
        numeroParcelas: d.numeroParcelas || 1,
        paymentMode: d.taxType || d.paymentMode || PaymentMode.PARCELADO,
        status: calculatedStatus,
        valorAtual: Number(breakdown.valorAtual || 0),
        pagamentos,
        lembreteEnviado: d.lembreteEnviado || null,
        createAt: d.createAt || d.createdAt || new Date().toISOString(),
        updateAt: d.updateAt || d.updatedAt || d.createAt || d.createdAt || new Date().toISOString()
      };

      setDivida(mD);
    } catch (error) {
      console.error('Falha ao buscar divida by id', error);
      setDivida(undefined);
    }
  }, [id]);

  useEffect(() => {
    fetchDivida();
  }, [fetchDivida]);

  return divida;
}

export function useDividaBreakdown(id: string | undefined) {
  const [breakdown, setBreakdown] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  const fetchBreakdown = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/debts/${id}/breakdown`);
      const b = res.data;
      if (b) {
         setBreakdown({
            principal: Number(b.valorOriginal || 0),
            jurosAcumulados: Number(b.jurosAcumulados || 0),
            jurosPagos: Number(b.totalJurosPagos || 0),
            principalPago: Number(b.totalPrincipalPago || 0),
            saldoPrincipal: Number(b.saldoPrincipal || 0),
            jurosPendentes: Number(b.jurosPendentes || 0),
            totalPago: Number(b.totalJurosPagos || 0) + Number(b.totalPrincipalPago || 0),
            valorAtual: Number(b.saldoPrincipal || 0) + Number(b.jurosPendentes || 0)
         });
      }
    } catch (err) {
      console.error('Erro ao buscar breakdown', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  return { breakdown, loading, refresh: fetchBreakdown };
}

// ----------------------------------------------------
// Functions to Interact with Backend
// ----------------------------------------------------

export async function createDivida(input: DividaInput): Promise<string> {
  const body = {
    clientId: input.clienteId,
    valorOriginal: input.valor,
    descricao: input.descricao,
    dataVencimento: input.dataVencimento.split('.')[0].replace('Z', ''),
    taxType: input.paymentMode,
    taxJuros: (input.taxValue || 0) / 100,
    numeroParcelas: input.numeroParcelas || 1
  };

  const res = await api.post('/debts', body);
  return res.data?.id || 'nova_divida';
}

export async function updateDivida(id: string, updates: Partial<DividaInput>): Promise<void> {
  if (updates.status) {
    await updateStatus(id, updates.status);
  }
}

export async function deleteDivida(id: string): Promise<void> {
  await api.delete(`/debts/${id}`);
}

export async function updateStatus(id: string, novoStatus?: StatusDivida) {
  await api.put(`/debts/${id}/status`);
}

export async function addPagamento(
  dividaId: string,
  valor: number,
  data: string,
  tipo: PagamentoTipo = 'parcela'
): Promise<void> {
  // Fetch the current debt to calculate the split
  const resDebt = await api.get(`/debts/${dividaId}`);
  const d = resDebt.data;

  // Local mapping to the logic
  const pagamentosPrevios = (d.payments || []).map((p: any) => ({
    data: p.paymentDate,
    valor: Number(p.valuePrincipal || 0) + Number(p.taxValue || 0),
    tipo: p.paymentType?.toLowerCase()
  }));

  const breakdown = calculateDebtBreakdown(
    Number(d.valorOriginal || 0),
    d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
    Number(d.taxJuros || 0) * 100,
    d.createAt || d.createdAt,
    d.taxType || PaymentMode.PARCELADO,
    pagamentosPrevios
  );

  let paymentType = 'PARCELA';
  let taxValue = 0;
  let valuePrincipal = 0;

  if (tipo === 'juros') {
    paymentType = 'JUROS';
    taxValue = valor;
    valuePrincipal = 0;
  } else if (tipo === 'quitacao') {
    paymentType = 'QUITACAO';
    taxValue = breakdown.jurosPendentes;
    valuePrincipal = breakdown.saldoPrincipal;
  } else {
    // Amortization (parcela) - covers pending interest first
    paymentType = 'PARCELA';
    taxValue = Math.min(valor, breakdown.jurosPendentes);
    valuePrincipal = valor - taxValue;
  }

  const body = {
    paymentType,
    taxValue,
    valuePrincipal,
    paymentDate: data.split('.')[0].replace('Z', '')
  };

  console.log('Enviando Pagamento:', body);
  await api.post(`/debts/${dividaId}/payments`, body);

  // Update status automatically based on payment type and breakdown
  if (tipo === 'quitacao') {
    await updateStatus(dividaId, StatusDivida.PAGO);
  } else if (d.paymentMode === PaymentMode.JUROS_MENSAL) {
    // For JUROS_MENSAL, check if principal is fully paid
    const newPrincipalPago = breakdown.principalPago + valuePrincipal;
    if (newPrincipalPago >= Number(d.valorOriginal || 0)) {
      await updateStatus(dividaId, StatusDivida.PAGO);
    }
  } else {
    // For PARCELADO, check if the debt is fully paid
    const newBreakdown = calculateDebtBreakdown(
      Number(d.valorOriginal || 0),
      d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
      Number(d.taxJuros || 0) * 100,
      d.createAt || d.createdAt,
      d.taxType || PaymentMode.PARCELADO,
      [...pagamentosPrevios, { data, valor: valor, tipo }]
    );
    if (newBreakdown.saldoPrincipal <= 0 && newBreakdown.jurosPendentes <= 0) {
      await updateStatus(dividaId, StatusDivida.PAGO);
    }
  }
}

export async function getDividaStats() {
  const res = await api.get('/debts');
  const all: any[] = res.data || [];

  // Stats iniciais zerados

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
    const valorOriginal = Number(d.valorOriginal || d.valor || 0);
    const status = d.status || StatusDivida.PENDENTE;

    // Use the calculator for real values
    const pagamentosPrevios = (d.payments || []).map((p: any) => ({
      data: p.paymentDate,
      valor: Number(p.valuePrincipal || 0) + Number(p.taxValue || 0),
      tipo: p.paymentType?.toLowerCase()
    }));

    // Stats iniciais zerados
    // Fetch breakdown for this debt to get real data since it's missing in DTO
    let apiBreakdown: any = null;
    try {
      const bdRes = await api.get(`/debts/${d.id}/breakdown`);
      apiBreakdown = bdRes.data;
    } catch (e) {
      // ignore
    }

    const breakdown = apiBreakdown ? {
      valorAtual: Number(apiBreakdown.saldoPrincipal || 0) + Number(apiBreakdown.jurosPendentes || 0),
      totalPago: Number(apiBreakdown.totalJurosPagos || 0) + Number(apiBreakdown.totalPrincipalPago || 0),
      jurosAcumulados: Number(apiBreakdown.jurosAcumulados || 0),
      jurosPendentes: Number(apiBreakdown.jurosPendentes || 0)
    } : calculateDebtBreakdown(
      valorOriginal,
      d.taxType === 'JUROS_MENSAL' ? TaxType.SIMPLES : TaxType.JUROS_FIXO,
      Number(d.taxJuros || 0) * 100,
      d.dataVencimento || d.createAt || d.createdAt || new Date().toISOString(),
      d.taxType || PaymentMode.PARCELADO,
      pagamentosPrevios
    );

    stats.totalValor += valorOriginal;
    stats.totalValorAtual += Number(breakdown.valorAtual || 0);
    stats.valorPago += Number(breakdown.totalPago || 0);
    stats.jurosAcumulados += Number(breakdown.jurosAcumulados || 0);
    stats.jurosPendentes += Number(breakdown.jurosPendentes || 0);

    if (status !== StatusDivida.PAGO && status !== StatusDivida.CANCELADA) {
      stats.totalEmprestado += valorOriginal;
    }

    switch (status) {
      case StatusDivida.PENDENTE:
      case 'PENDENTE':
        stats.pendentes++;
        stats.valorPendente += breakdown.valorAtual;
        break;
      case StatusDivida.PAGO:
      case 'PAGA':
        stats.pagas++;
        break;
      case StatusDivida.ATRASADO:
      case 'VENCIDA':
        stats.vencidas++;
        stats.valorVencido += breakdown.valorAtual;
        break;
      case StatusDivida.CANCELADA:
      case 'CANCELADA':
        stats.canceladas++;
        break;
      case StatusDivida.NEGOCIANDO:
      case 'NEGOCIANDO':
        stats.negociando++;
        break;
    }
  }

  return stats;
}
