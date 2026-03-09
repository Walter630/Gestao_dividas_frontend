import Dexie, { type Table } from 'dexie';
import type { Divida } from './types';

export class DebtDatabase extends Dexie {
  dividas!: Table<Divida>;

  constructor() {
    super('DebtTrackerDB');
    this.version(1).stores({
      dividas:
        'id, devedorNome, devedorEmail, status, taxType, dataVencimento, createAt, updateAt',
    });
  }
}

export const db = new DebtDatabase();

