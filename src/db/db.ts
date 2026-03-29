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

    // Version 3: Add paymentMode to debts and tipo to pagamentos
    this.version(3).stores({
      dividas: 'id, clienteId, devedorNome, status, taxType, paymentMode, dataVencimento, createAt, updateAt',
      clientes: 'id, nome, email, telefone',
      configuracoes: 'id'
    }).upgrade(async (tx) => {
      const allDividas = await tx.table('dividas').toArray();
      for (const divida of allDividas) {
        const updates: any = {};
        // Set default paymentMode to PARCELADO for existing debts
        if (!divida.paymentMode) {
          updates.paymentMode = 'PARCELADO';
        }
        // Add tipo to existing pagamentos
        if (divida.pagamentos && divida.pagamentos.length > 0) {
          const updatedPagamentos = divida.pagamentos.map((p: any) => ({
            ...p,
            tipo: p.tipo || 'parcela',
          }));
          updates.pagamentos = updatedPagamentos;
        }
        if (Object.keys(updates).length > 0) {
          await tx.table('dividas').update(divida.id, updates);
        }
      }

      // Update configuracoes with paymentModePadrao
      const config = await tx.table('configuracoes').get(1);
      if (config && !config.paymentModePadrao) {
        await tx.table('configuracoes').update(1, { paymentModePadrao: 'PARCELADO' });
      }
    });
  }
}

export const db = new DebtDatabase();

