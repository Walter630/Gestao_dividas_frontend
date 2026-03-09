export enum StatusDivida {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA',
  NEGOCIANDO = 'NEGOCIANDO',
}

export enum TaxType {
  SIMPLES = 'SIMPLES',
  COMPOSTA = 'COMPOSTA',
  JUROS_FIXO = 'JUROS_FIXO',
  SEM_JUROS = 'SEM_JUROS',
}

export interface Divida {
  id?: string;
  devedorNome: string;
  devedorEmail: string;
  valor: number;
  descricao: string;
  dataVencimento: string;
  status: StatusDivida;
  taxType: TaxType;
  taxValue: number;
  valorAtual: number;
  lembreteEnviado: string | null;
  createAt: string;
  updateAt: string;
}

export type DividaInput = Omit<Divida, 'id' | 'createAt' | 'updateAt' | 'valorAtual' | 'lembreteEnviado'>;

export const STATUS_LABELS: Record<StatusDivida, string> = {
  [StatusDivida.PENDENTE]: 'Pendente',
  [StatusDivida.PAGA]: 'Paga',
  [StatusDivida.VENCIDA]: 'Vencida',
  [StatusDivida.CANCELADA]: 'Cancelada',
  [StatusDivida.NEGOCIANDO]: 'Negociando',
};

export const TAX_TYPE_LABELS: Record<TaxType, string> = {
  [TaxType.SIMPLES]: 'Juros Simples',
  [TaxType.COMPOSTA]: 'Juros Composta',
  [TaxType.JUROS_FIXO]: 'Juros Fixo (Mensal)',
  [TaxType.SEM_JUROS]: 'Sem Juros',
};

export const STATUS_COLORS: Record<StatusDivida, string> = {
  [StatusDivida.PENDENTE]: '#f59e0b',
  [StatusDivida.PAGA]: '#10b981',
  [StatusDivida.VENCIDA]: '#ef4444',
  [StatusDivida.CANCELADA]: '#6b7280',
  [StatusDivida.NEGOCIANDO]: '#3b82f6',
};
