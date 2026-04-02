import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { cardService } from '../../services/cardService';

export const NewCardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    limite: '',
    diaFechamento: '',
    diaVencimento: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await cardService.create({
        nome: formData.nome,
        limite: Number(formData.limite),
        diaFechamento: Number(formData.diaFechamento),
        diaVencimento: Number(formData.diaVencimento),
        ativo: true,
      });
      navigate('/cartoes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar cartão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <header className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-2 mb-4"
            onClick={() => navigate('/cartoes')}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
          >
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Novo Cartão</h1>
          <p className="text-gray-400 mt-1">Configure um novo cartão de crédito para acompanhar faturas.</p>
        </header>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nome do Cartão"
                placeholder="Ex: Nubank, Inter, Visa Infinite"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />

              <Input
                label="Limite Total (R$)"
                type="number"
                placeholder="0,00"
                value={formData.limite}
                onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Dia do Fechamento"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 10"
                  value={formData.diaFechamento}
                  onChange={(e) => setFormData({ ...formData, diaFechamento: e.target.value })}
                  required
                />
                <Input
                  label="Dia do Vencimento"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 17"
                  value={formData.diaVencimento}
                  onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                type="submit" 
                className="flex-1" 
                loading={loading}
              >
                Salvar Cartão
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/cartoes')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
