import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { cardService } from '../../services/cardService';
import { purchaseService } from '../../services/purchaseService';
import { calcularParcelas } from '../../utils/installmentUtils';
import { CartaoCredito, StatusCompra } from '../../db/types';

export const NewPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cartaoId: '',
    loja: '',
    descricao: '',
    valorTotal: '',
    quantidadeParcelas: '1',
    dataCompra: new Date().toISOString().split('T')[0],
    categoria: 'Geral',
  });

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await cardService.getAll();
        setCards(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, cartaoId: data[0].id! }));
        }
      } catch (err) {
        console.error('Erro ao buscar cartões:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCards();
  }, []);

  const selectedCard = useMemo(() => 
    cards.find(c => c.id === formData.cartaoId), 
    [cards, formData.cartaoId]
  );

  const previewParcelas = useMemo(() => {
    if (!selectedCard || !formData.valorTotal || !formData.quantidadeParcelas || !formData.dataCompra) {
      return [];
    }
    return calcularParcelas(
      Number(formData.valorTotal),
      Number(formData.quantidadeParcelas),
      formData.dataCompra,
      selectedCard.diaFechamento,
      selectedCard.diaVencimento
    );
  }, [selectedCard, formData.valorTotal, formData.quantidadeParcelas, formData.dataCompra]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    
    setLoading(true);
    setError(null);

    try {
      const cardId = formData.cartaoId;
      const desc = formData.descricao;

      const payload = {
        // Envia o objeto aninhado esperado pelo Spring Data JPA
        cartaoCredito: { id: cardId },
        
        loja: formData.loja,
        descricao: formData.descricao,
        valorTotal: Number(formData.valorTotal),
        quantidadeParcelas: Number(formData.quantidadeParcelas),
        dataCompra: `${formData.dataCompra}T12:00:00`,
        categoria: formData.categoria,
        juros: false,
        status: StatusCompra.ATIVA,
      };

      await purchaseService.create(payload as any);
      navigate('/cartoes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar compra.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Layout><div className="p-6 text-center text-gray-400">Carregando...</div></Layout>;
  }

  if (cards.length === 0) {
    return (
      <Layout>
        <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Nenhum cartão encontrado</h1>
          <p className="text-gray-400">Você precisa cadastrar um cartão antes de lançar uma compra.</p>
          <Button onClick={() => navigate('/cartoes/novo')}>Cadastrar Cartão</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <header>
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-2 mb-4"
            onClick={() => navigate('/cartoes')}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
          >
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Lançar Compra Parcelada</h1>
          <p className="text-gray-400 mt-1">Registre uma nova compra e veja a distribuição das parcelas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Selecionar Cartão</label>
                  <select 
                    className="w-full bg-dark-400 border border-dark-300/50 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                    value={formData.cartaoId}
                    onChange={(e) => setFormData({ ...formData, cartaoId: e.target.value })}
                    required
                  >
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>{card.name}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Loja / Estabelecimento"
                  placeholder="Ex: Amazon, Mercado Livre"
                  value={formData.loja}
                  onChange={(e) => setFormData({ ...formData, loja: e.target.value })}
                  required
                />

                <Input
                  label="Descrição do Produto"
                  placeholder="Ex: Notebook, Smartphone"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Valor Total (R$)"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valorTotal}
                    onChange={(e) => setFormData({ ...formData, valorTotal: e.target.value })}
                    required
                  />
                  <Input
                    label="Parcelas"
                    type="number"
                    min="1"
                    max="96"
                    value={formData.quantidadeParcelas}
                    onChange={(e) => setFormData({ ...formData, quantidadeParcelas: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Data da Compra"
                  type="date"
                  value={formData.dataCompra}
                  onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-6" loading={loading}>
                Confirmar Lançamento
              </Button>
            </form>
          </Card>

          {/* Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Preview das Parcelas</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-dark-300">
              {previewParcelas.length > 0 ? (
                previewParcelas.map((p, idx) => (
                  <div 
                    key={idx}
                    className="bg-dark-600 border border-dark-300/30 rounded-xl p-4 flex justify-between items-center animate-in fade-in slide-in-from-right-4 duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">{p.numeroParcela}ª PARCELA</p>
                      <p className="text-white font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase">VENCIMENTO</p>
                      <p className="text-primary-400 font-semibold">{new Date(p.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-dark-300/40 rounded-2xl">
                  <p className="text-gray-500 text-sm italic">Preencha os dados da compra para ver o cronograma.</p>
                </div>
              )}
            </div>

            {previewParcelas.length > 0 && (
              <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                <p className="text-xs text-primary-400 font-medium">Atenção</p>
                <p className="text-gray-400 text-xs mt-1">
                  Este cronograma é baseado no fechamento do cartão (Dia {selectedCard?.diaFechamento}) e vence no Dia {selectedCard?.diaVencimento}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
