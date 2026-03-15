import Dexie, { type Table } from 'dexie';
import type { Divida, Cliente, Configuracoes, TaxType } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DebtDatabase extends Dexie {
  dividas!: Table<Divida>;
  clientes!: Table<Cliente>;
  configuracoes!: Table<Configuracoes>;

  constructor() {
    super('DebtTrackerDB');
    
    this.version(1).stores({
      dividas: 'id, devedorNome, devedorEmail, status, taxType, dataVencimento, createAt, updateAt',
    });

    this.version(2).stores({
      dividas: 'id, clienteId, devedorNome, status, taxType, dataVencimento, createAt, updateAt',
      clientes: 'id, nome, email, telefone',
      configuracoes: 'id'
    }).upgrade(async (tx) => {
      // Migration: Create clients for existing debts that lack a clienteId
      const allDividas = await tx.table('dividas').toArray();
      const existingClients = new Map<string, string>(); // nome -> clienteId

      for (const divida of allDividas) {
        if (!divida.clienteId) {
          const nomeKey = divida.devedorNome.toLowerCase().trim();
          let cId = existingClients.get(nomeKey);
          
          if (!cId) {
            cId = uuidv4();
            await tx.table('clientes').add({
              id: cId,
              nome: divida.devedorNome,
              email: divida.devedorEmail,
              createAt: new Date().toISOString()
            });
            existingClients.set(nomeKey, cId);
          }
          
          await tx.table('dividas').update(divida.id, { clienteId: cId });
        }
      }
    });
  }
}

export const db = new DebtDatabase();

