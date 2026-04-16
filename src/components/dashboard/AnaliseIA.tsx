import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Divida } from '../../db/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { purchaseService } from '../../services/purchaseService';

interface AnaliseIAProps {
  dividas: Divida[];
}

export const AnaliseIA: React.FC<AnaliseIAProps> = ({ dividas }) => {
  const [analiseCompleta, setAnaliseCompleta] = useState<string>('');
  const [analiseExibida, setAnaliseExibida] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { user } = useAuthStore();

  // Efeito de "Digitando" para humanizar a resposta
  useEffect(() => {
    if (analiseCompleta && analiseExibida.length < analiseCompleta.length) {
      const timeout = setTimeout(() => {
        setAnaliseExibida(analiseCompleta.slice(0, analiseExibida.length + 2));
      }, 15);
      return () => clearTimeout(timeout);
    }
  }, [analiseCompleta, analiseExibida]);

  const solicitarAnalise = async () => {
    setLoading(true);
    setError('');
    setAnaliseCompleta('');
    setAnaliseExibida('');
    
    try {
      const nomeDoUsuario = user?.email?.split('@')[0] || 'Usuário';

      // Busca parcelas do mês atual para dar contexto de vencimento à IA
      const now = new Date();
      let parcelas: any[] = [];
      try {
        parcelas = await purchaseService.getInstallmentsByMonth(now.getFullYear(), now.getMonth() + 1);
      } catch (e) {
        console.warn("Não foi possível buscar parcelas para a IA", e);
      }

      // Mapeia as dívidas
      const dividasFormatadas = dividas.map(d => ({
        descricao: d.devedorNome || d.descricao || 'Dívida',
        valor: d.valorAtual || d.valor || 0,
        juros: d.taxValue || 0,
        vencimento: d.dataVencimento || 'N/A'
      }));

      // Envia para o Python
      const response = await axios.post('http://localhost:5000/ia/analisar', { 
        nome: nomeDoUsuario,
        dividas: dividasFormatadas,
        parcelas: parcelas.map(p => ({
            valor: p.valor,
            dataVencimento: p.dataVencimento,
            numeroParcela: p.numeroParcela,
            status: p.status
        }))
      });
      
      if (response.data && response.data.analise) {
        // Limpa a formatação Markdown (removendo ** que o usuário não gosta)
        const textoLimpo = response.data.analise.replace(/\*\*/g, '');
        setAnaliseCompleta(textoLimpo);
      } else {
        throw new Error('Resposta da IA não contém análise.');
      }
    } catch (err: any) {
      console.error("Erro ao consultar a IA", err);
      setError('Ocorreu um problema ao gerar sua estratégia. Verifique se o servidor de IA está ativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-dark-500/90 to-dark-600 border-primary-500/30 w-full shadow-2xl animate-in fade-in duration-700">
      {/* Background Decorativo */}
      <div className="absolute -top-10 -right-10 text-9xl opacity-5 pointer-events-none select-none">
        🤖
      </div>
      
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary-500/20 p-3 rounded-2xl text-primary-400 border border-primary-500/20 shadow-inner">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {loading && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Assistente Financeiro IA
                <span className="text-[10px] bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full border border-primary-500/30 uppercase tracking-widest font-black">Beta</span>
              </h3>
              <p className="text-sm text-gray-400 font-medium">Análise estratégica baseada no seu perfil de dívidas</p>
            </div>
          </div>

          <Button 
            onClick={solicitarAnalise} 
            loading={loading}
            variant="primary"
            className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 w-full sm:w-auto px-8 py-2.5 font-bold transition-all hover:scale-105 active:scale-95"
          >
            {analiseCompleta ? 'Refazer Consultoria' : 'Gerar Estratégia Agora'}
          </Button>
        </div>
        
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mt-2 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Resposta Elaborada */}
        {analiseExibida && (
          <div className="w-full mt-4 p-6 rounded-2xl bg-dark-400/40 border border-dark-300/50 backdrop-blur-md animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white text-xs shadow-lg">
                AI
              </div>
              <h4 className="text-primary-300 font-bold uppercase tracking-wider text-xs">Recomendação do Mentor</h4>
            </div>
            
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base selection:bg-primary-500/30">
              {analiseExibida}
              {analiseExibida.length < analiseCompleta.length && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse align-middle"></span>
              )}
            </div>

            {analiseExibida.length === analiseCompleta.length && (
               <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                  <span className="text-[10px] text-gray-500 font-mono italic">Análise gerada em tempo real pelo modelo Gemini 1.5-Flash</span>
               </div>
            )}
          </div>
        )}

        {!analiseExibida && !loading && !error && (
          <div className="w-full mt-4 py-8 border-2 border-dashed border-dark-400 rounded-2xl flex flex-col items-center justify-center gap-3 opacity-60">
            <svg className="w-12 h-12 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-dark-200">Clique no botão acima para que a IA analise suas dívidas e prazos.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
