import { api } from './api';
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
  try {
    const [dividasRes, clientesRes] = await Promise.all([
      api.get('/debts'),
      api.get('/client')
    ]);

    const dividas = dividasRes.data;
    const clientes = clientesRes.data;
    
    // Map clients
    const clientMap = new Map();
    clientes.forEach((c: any) => clientMap.set(String(c.id), c));

    let csvContent = "Cliente;Email;Telefone;Descricao;Status;Valor Original;Valor Atual;Juros Acumulados;Total Pago;Vencimento\n";

    for (const d of dividas) {
      const clienteId = String(d.cliente?.id || d.clientId);
      const cliente = clientMap.get(clienteId);
      const nome = d.devedorNome || cliente?.nome || cliente?.name || 'Desconhecido';
      const email = d.devedorEmail || cliente?.email || '';
      const tel = cliente?.telefone || '';
      
      // safe quotes for CSV processing
      const cleanDesc = `"${(d.descricao || '').replace(/"/g, '""')}"`;
      const cleanNome = `"${(nome || '').replace(/"/g, '""')}"`;
      
      const status = STATUS_LABELS[d.status || 'PENDENTE'] || d.status;
      const pagamentos = d.pagamentos || [];
      const totalPago = pagamentos.reduce((acc: any, p: any) => acc + (p.valor || p.valorPago || 0), 0) || 0;
      
      const valor = d.valorOriginal || d.valor || 0;
      const valorAtual = d.valorAtual || valor;
      const juros = valorAtual - valor;

      const row = [
        cleanNome,
        email,
        tel,
        cleanDesc,
        status,
        valor.toFixed(2),
        valorAtual.toFixed(2),
        juros.toFixed(2),
        totalPago.toFixed(2),
        formatDate(d.dataVencimento)
      ].join(';');
      
      csvContent += row + "\n";
    }

    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`relatorio_dividas_${dateStr}.csv`, csvContent);
  } catch (error) {
    console.error('Falha ao exportar CSV:', error);
    alert('Erro ao tentar exportar relatório.');
  }
}
