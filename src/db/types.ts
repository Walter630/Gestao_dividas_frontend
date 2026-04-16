export enum StatusDivida {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
  PARCIAL = 'PARCIAL',
  CANCELADA = 'CANCELADA',
  NEGOCIANDO = 'NEGOCIANDO',
}

export enum StatusCompra {
  ATIVA = 'PENDENTE', // Mapeado para PENDENTE para compatibilidade com o Java
  QUITADA = 'PAGO',
  CANCELADA = 'CANCELADA',
}

export enum StatusParcela {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  ATRASADA = 'ATRASADA',
}

export enum TaxType {
  SIMPLES = 'SIMPLES',
  COMPOSTA = 'COMPOSTA',
  JUROS_FIXO = 'JUROS_FIXO',
  SEM_JUROS = 'SEM_JUROS',
}

export enum PaymentMode {
  JUROS_MENSAL = 'JUROS_MENSAL',
  PARCELADO = 'PARCELADO',
}

export type PagamentoTipo = 'juros' | 'parcela' | 'quitacao';

export interface Cliente {
  id?: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  createAt: string;
}

export interface Configuracoes {
  id?: number;
  nomeEmpresa: string;
  taxaPadrao: number;
  tipoJurosPadrao: TaxType;
  paymentModePadrao: PaymentMode;
  notificacoesPermitidas: boolean;
  whatsappTemplate: string;
}

export interface Divida {
  id?: string;
  clienteId?: string;
  devedorNome: string;
  devedorEmail?: string;
  valor: number;
  descricao: string;
  dataVencimento: string;
  status: StatusDivida;
  taxType: TaxType;
  taxValue: number;
  numeroParcelas: number;
  paymentMode: PaymentMode;
  valorAtual: number;
  lembreteEnviado: string | null;
  pagamentos?: Pagamento[];
  createAt: string;
  updateAt: string;
}

export type DividaInput = Omit<Divida, 'id' | 'createAt' | 'updateAt' | 'valorAtual' | 'lembreteEnviado' | 'pagamentos'>;

export interface Pagamento {
  id: string;
  data: string;
  valor: number;
  tipo: PagamentoTipo;
}

// Novos Tipos para Cartões e Parcelamentos
export interface CartaoCredito {
  id?: string;
  name: string;
  valorLimite: number;
  limitDisponivel: number;
  diaFechamento: number;
  diaVencimento: number;
  ativo?: boolean;
  userId?: string;
  createAt?: string;
}

export interface CompraParcelada {
  id?: string;
  cartaoId: string;
  loja: string;
  descricao: string;
  categoria?: string;
  valorTotal: number;
  quantidadeParcelas: number;
  dataCompra: string;
  juros: boolean;
  taxaJuros?: number;
  status: StatusCompra;
  createAt: string;
}

export interface Parcela {
  id?: string;
  compraId: string;
  numeroParcela: number; // ex: 1 de 10
  valor: number;
  dataVencimento: string;
  status: StatusParcela;
  dataPagamento?: string;
  valorPago?: number;
}

export const STATUS_LABELS: Record<StatusDivida, string> = {
  [StatusDivida.PENDENTE]: 'Pendente',
  [StatusDivida.PAGO]: 'Paga',
  [StatusDivida.ATRASADO]: 'Atrasado',
  [StatusDivida.CANCELADA]: 'Cancelada',
  [StatusDivida.NEGOCIANDO]: 'Negociando',
  [StatusDivida.PARCIAL]: 'Pago Parcial',
};

export const TAX_TYPE_LABELS: Record<TaxType, string> = {
  [TaxType.SIMPLES]: 'Juros Simples',
  [TaxType.COMPOSTA]: 'Juros Composta',
  [TaxType.JUROS_FIXO]: 'Juros Fixo (Mensal)',
  [TaxType.SEM_JUROS]: 'Sem Juros',
};

export const STATUS_PARCELA_LABELS: Record<StatusParcela, string> = {
  [StatusParcela.PENDENTE]: 'Pendente',
  [StatusParcela.PAGA]: 'Paga',
  [StatusParcela.ATRASADA]: 'Atrasada',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  [PaymentMode.JUROS_MENSAL]: 'Pagar Juros Mensal + Quitar Total',
  [PaymentMode.PARCELADO]: 'Parcelado (Amortização)',
};

export const STATUS_COLORS: Record<StatusDivida, string> = {
  [StatusDivida.PENDENTE]: '#f59e0b',
  [StatusDivida.PAGO]: '#10b981',
  [StatusDivida.ATRASADO]: '#ef4444',
  [StatusDivida.CANCELADA]: '#6b7280',
  [StatusDivida.NEGOCIANDO]: '#3b82f6',
  [StatusDivida.PARCIAL]: '#3b82f6',
};
