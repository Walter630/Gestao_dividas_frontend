import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import type { Cliente } from '../types';

export function useAllClientes() {
  const [clientes, setClientes] = useState<Cliente[] | undefined>(undefined);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await api.get('/client');
      // Assume array from backend
      setClientes(response.data);
    } catch (error) {
      console.error('Failed to fetch clientes', error);
      setClientes([]);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return clientes; // Same return signature as useLiveQuery
}

// O backend criado parece não ter uma rota GET /client/{id}, 
// usaremos de todos os clientes filtrando para manter o mesmo comportamento caso falte a rota
export function useClienteById(id?: string) {
  const [cliente, setCliente] = useState<Cliente | undefined>(undefined);

  const fetchCliente = useCallback(async () => {
    if (!id) return;
    try {
      // Como não foi listada rota de get by id por Client, a gente pega da listagem
      const response = await api.get('/client');
      const found = response.data.find((c: Cliente) => c.id === id); // Assumindo campo "id" retornado
      setCliente(found);
    } catch (error) {
      console.error('Failed to fetch cliente by id', error);
      setCliente(undefined);
    }
  }, [id]);

  useEffect(() => {
    fetchCliente();
  }, [fetchCliente]);

  return cliente;
}

export async function createCliente(data: Omit<Cliente, 'id' | 'createAt'>) {
  // Rota POST /client espera: name, email, cpf, telefone
  const payload = {
    name: data.nome,    // Mapeando nomes se o Frontend usasse "nome" e backend "name"
    email: data.email,
    cpf: data.cpf,
    telefone: data.telefone
  };
  
  const response = await api.post('/client', payload);
  return response.data?.id || response.data?.name; // Retorna algo como ID
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, 'id' | 'createAt'>>) {
  // O backend não possui rota PUT/PATCH /client/{id} por hora. 
  console.warn('Backend não tem rota updateCliente. Pulando.');
}

export async function deleteCliente(id: string) {
  // O backend não possui rota DELETE /client/{id}
  console.warn('Backend não tem rota deleteCliente. Pulando.');
}
