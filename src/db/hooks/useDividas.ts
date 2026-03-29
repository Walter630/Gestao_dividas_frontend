import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import type { Divida, DividaInput, PagamentoTipo } from '../types';
import { StatusDivida, PaymentMode } from '../types';
import { calculateCurrentValue, calculateDebtBreakdown } from '../../services/taxCalculator';

// ----------------------------------------------------
// Custom Hooks for the Frontend React Comps
// ----------------------------------------------------

export function useAllDividas() {
  const [dividas, setDividas] = useState<Divida[] | undefined>(undefined);

  const fetchDividas = useCallback(async () => {
    try {
      const response = await api.get('/debts');
      
      // Mapeando dados para bater com a interface do Frontend
      const backendArray = response.data.map((d: any) => ({
        id: String(d.id),
        clienteId: String(d.cliente?.id || d.clientId), // Ajuste as chaves conforme retorno backend
        valor: d.valorOriginal,
        descricao: d.descricao,
        dataVencimento: d.dataVencimento,
        taxType: d.taxType,
        taxValue: Number(d.taxJuros),   // Ajuste para interface
        numeroParcelas: d.numeroParcelas || 1,
        paymentMode: PaymentMode.PARCELADO,
        status: d.status || StatusDivida.PENDENTE,
        valorAtual: d.valorOriginal, // Idealmente o backend manda o breakdown junto
        pagamentos: d.pagamentos || [],
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
      
      // Convertendo a resposta da API para a interface `Divida` do seu Frontend
      const mD: Divida = {
        id: String(d.id),
        clienteId: String(d.cliente?.id || d.clientId || d.clienteId),
        valor: d.valorOriginal,
        descricao: d.descricao,
        dataVencimento: d.dataVencimento,
        taxType: d.taxType,
        taxValue: Number(d.taxJuros),
        numeroParcelas: d.numeroParcelas || 1,
        paymentMode: PaymentMode.PARCELADO,
        status: d.status || StatusDivida.PENDENTE,
        valorAtual: d.valorOriginal,
        pagamentos: d.pagamentos || [],
        createAt: d.createAt || new Date().toISOString()
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

// ----------------------------------------------------
// Functions to Interact with Backend
// ----------------------------------------------------

export async function createDivida(input: DividaInput): Promise<string> {
  // Converte a interface do frontend para o body aceito pelo backend:
  // POST /debts -> clientId, valorOriginal, descricao, dataVencimento, taxType, taxJuros, numeroParcelas
  const body = {
    clientId: input.clienteId,
    valorOriginal: input.valor,
    descricao: input.descricao,
    dataVencimento: input.dataVencimento, 
    taxType: input.taxType, // JUROS_MENSAL / JUROS_SIMPLES
    taxJuros: input.taxValue, // de 0.0 a 1.0 (ex 0.05)
    numeroParcelas: input.numeroParcelas || 1
  };

  const res = await api.post('/debts', body);
  return res.data?.id || 'nova_divida';
}

export async function updateDivida(id: string, updates: Partial<DividaInput>): Promise<void> {
  // Pelas rotas informadas, não existe PUT /debts/{id} a não ser /status.
  console.warn('Backend sem suporte total a updateDivida. Apenas status e pagamentos existem.');
  if (updates.status) {
    await updateStatus(id, updates.status);
  }
}

export async function deleteDivida(id: string): Promise<void> {
  // Rota DELETE não listada
  console.warn('Mock: backend sem rota DELETE /debts.');
}

export async function updateStatus(id: string, novoStatus: StatusDivida) {
  // Rotas listadas: PUT /debts/{id}/status 
  await api.put(`/debts/${id}/status`, { status: novoStatus });
}

export async function addPagamento(
  dividaId: string,
  valor: number,
  data: string,
  tipo: PagamentoTipo = 'parcela'
): Promise<void> {
  // POST /debts/{debtId}/payments -> valorPago, dataPagamento
  const body = {
    valorPago: valor,
    dataPagamento: data // data em formato ISO LocalDateTime/Date
  };
  await api.post(`/debts/${dividaId}/payments`, body);
  
  if (tipo === 'quitacao') {
    await updateStatus(dividaId, StatusDivida.PAGA);
  }
}

// ----------------------------------------------------
// Lógicas Locais / Stats mantidas para o Dashboard
// ----------------------------------------------------

export async function markReminderSent(id: string): Promise<void> {
  console.warn('Backend responsável agora.');
}

export async function updateAllCurrentValues(): Promise<void> {
  console.warn('Backend assumiu job responsável de atualização e valores diários.');
}

export async function autoMarkOverdue(): Promise<void> {
  console.warn('Backend assumiu cron job de vencidas.');
}

// Função de estatísticas para o Dashboard que acessa API `/debts`
export async function getDividaStats() {
  const res = await api.get('/debts');
  const all: any[] = res.data || [];
  
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
    // Map minimal data to compute local calculations if backend didn't do it.
    // Ideal: GET `/dashboard/stats` no Backend real!
    const valorOriginal = d.valorOriginal || d.valor || 0;
    const pagamentos = d.pagamentos || [];
    const status = d.status || StatusDivida.PENDENTE;

    stats.totalValor += valorOriginal;
    stats.totalValorAtual += valorOriginal; // (Precisa refinar calculos ou buscar breakdown /debts/{id}/breakdown)

    const totalAmortizado = pagamentos.reduce((acc: any, p: any) => acc + (p.valor || p.valorPago || 0), 0) || 0;
    stats.valorPago += totalAmortizado;

    if (status !== StatusDivida.PAGA && status !== StatusDivida.CANCELADA) {
      stats.totalEmprestado += valorOriginal;
      stats.jurosAcumulados += 0; // Necessaria Rota de Summary Backend para estatísticas 100% corretas
      stats.jurosPendentes += 0;
    }

    switch (status) {
      case StatusDivida.PENDENTE:
      case 'PENDENTE':
        stats.pendentes++;
        stats.valorPendente += valorOriginal - totalAmortizado;
        break;
      case StatusDivida.PAGA:
      case 'PAGA':
        stats.pagas++;
        if (totalAmortizado === 0) {
          stats.valorPago += valorOriginal;
        }
        break;
      case StatusDivida.VENCIDA:
      case 'VENCIDA':
        stats.vencidas++;
        stats.valorVencido += valorOriginal;
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
