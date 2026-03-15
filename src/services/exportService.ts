import { db } from '../db';
import { formatCurrency, formatDate } from './taxCalculator';
import { STATUS_LABELS } from '../db/types';

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportDividasCSV() {
  const dividas = await db.dividas.toArray();
  const clientes = await db.clientes.toArray();
  
  // Map clients
  const clientMap = new Map();
  clientes.forEach(c => clientMap.set(c.id, c));

  let csvContent = "ID,Cliente,Email,Telefone,Descricao,Status,Valor Original,Valor Atual,Juros Acumulados,Total Pago,Vencimento\n";

  for (const d of dividas) {
    const cliente = clientMap.get(d.clienteId);
    const nome = cliente?.nome || d.devedorNome;
    const email = cliente?.email || d.devedorEmail || '';
    const tel = cliente?.telefone || '';
    
    // safe quotes for CSV processing
    const cleanDesc = `"${d.descricao.replace(/"/g, '""')}"`;
    const cleanNome = `"${nome.replace(/"/g, '""')}"`;
    
    const status = STATUS_LABELS[d.status];
    const totalPago = d.pagamentos?.reduce((acc, p) => acc + p.valor, 0) || 0;
    const juros = d.valorAtual - d.valor;

    const row = [
      d.id,
      cleanNome,
      email,
      tel,
      cleanDesc,
      status,
      d.valor,
      d.valorAtual,
      juros,
      totalPago,
      formatDate(d.dataVencimento)
    ].join(',');
    
    csvContent += row + "\n";
  }

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`relatorio_dividas_${dateStr}.csv`, csvContent);
}
