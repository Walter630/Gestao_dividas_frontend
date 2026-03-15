import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Cliente } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useAllClientes() {
  return useLiveQuery(() => db.clientes.orderBy('nome').toArray());
}

export function useClienteById(id?: string) {
  return useLiveQuery(() => (id ? db.clientes.get(id) : undefined), [id]);
}

export async function createCliente(data: Omit<Cliente, 'id' | 'createAt'>) {
  const id = uuidv4();
  await db.clientes.add({
    ...data,
    id,
    createAt: new Date().toISOString(),
  });
  return id;
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, 'id' | 'createAt'>>) {
  await db.clientes.update(id, data);
}

export async function deleteCliente(id: string) {
  // Option: check if client has debts before deleting
  const debts = await db.dividas.where({ clienteId: id }).count();
  if (debts > 0) {
    throw new Error('Não é possível excluir um cliente que possui dívidas atreladas.');
  }
  await db.clientes.delete(id);
}
