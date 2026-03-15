import { db } from '../db';
import { formatCurrency, formatDate } from './taxCalculator';
import { STATUS_LABELS } from '../db/types';

function downloadFile(filename: string, content: string) {
  // Add UTF-8 BOM so Excel recognizes special characters (like R$)
  const blob = new Blob(["\ufeff" + content], { type: 'text/csv;charset=utf-8;' });
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

  let csvContent = "Cliente;Email;Telefone;Descricao;Status;Valor Original;Valor Atual;Juros Acumulados;Total Pago;Vencimento\n";

  for (const d of dividas) {
    const cliente = clientMap.get(d.clienteId);
    const nome = d.devedorNome || cliente?.nome || 'Desconhecido';
    const email = d.devedorEmail || cliente?.email || '';
    const tel = cliente?.telefone || '';
    
    // safe quotes for CSV processing
    const cleanDesc = `"${d.descricao.replace(/"/g, '""')}"`;
    const cleanNome = `"${nome.replace(/"/g, '""')}"`;
    
    const status = STATUS_LABELS[d.status];
    const totalPago = d.pagamentos?.reduce((acc, p) => acc + p.valor, 0) || 0;
    const juros = d.valorAtual - d.valor;

    const row = [
      cleanNome,
      email,
      tel,
      cleanDesc,
      status,
      d.valor.toFixed(2),
      d.valorAtual.toFixed(2),
      juros.toFixed(2),
      totalPago.toFixed(2),
      formatDate(d.dataVencimento)
    ].join(';');
    
    csvContent += row + "\n";
  }

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`relatorio_dividas_${dateStr}.csv`, csvContent);
}
