import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { toast } from 'sonner';

export const SubscriptionPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States para o checkout e Modal do QR Code Pier
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ qrCode: string; qrCodeBase64?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMyPlan = async () => {
    try {
      const response = await api.get('/subscription/my-plan');
      setCurrentPlan(response.data);
    } catch (error) {
      console.error('Falha ao buscar plano', error);
      // Fallback em caso de erro para manter visual
      setCurrentPlan({
        name: 'Não Encontrado',
        status: 'Inativo',
        renewsAt: '---',
        usage: { dividas: 0, limit: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPlan();
  }, []);

  const handleCheckout = async (planType: 'FREE' | 'PRO' | 'PREMIUM') => {
    setIsCheckoutLoading(planType);
    try {
      const response = await api.post(`/subscription/checkout/${planType}`);
      
      if (planType === 'FREE') {
        toast.success('Plano Gratuito ativado com sucesso!');
        fetchMyPlan(); // Atualiza o plano na tela
      } else {
        // Se for PRO ou PREMIUM, pegamos o Payload do QR Code
        // Assumindo que o back manda { qrCode: "000201...", qrCodeBase64: "iVBOR..." }
        setQrCodeData({
          qrCode: response.data?.qrCode || response.data || 'Código PIX Indisponível',
          qrCodeBase64: response.data?.qrCodeBase64 || null
        });
        setIsModalOpen(true);
      }
    } catch (error: any) {
      console.error('Erro no checkout', error);
      toast.error(error.response?.data?.message || 'Erro ao gerar checkout do plano.');
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  const copyToClipboard = () => {
    if (qrCodeData?.qrCode) {
      navigator.clipboard.writeText(qrCodeData.qrCode);
      toast.success('Código PIX copiado!');
    }
  };

  return (
    <Layout>
      <Topbar 
        title="Meu Plano" 
        subtitle="Gerencie sua assinatura e limites do sistema" 
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Seu Plano Atual</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-bold rounded uppercase">
                      {currentPlan?.name || currentPlan?.planName || currentPlan?.tipo || 'Desconhecido'}
                    </span>
                    <span className="text-gray-500 text-xs text-uppercase">{currentPlan?.status || 'Ativo'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Próxima renovação</p>
                  <p className="text-white font-medium">{currentPlan?.renewsAt || currentPlan?.dataExpiracao || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Limite de Dívidas</span>
                    <span className="text-white font-medium">
                      {currentPlan?.usage?.dividas || 0} / {currentPlan?.usage?.limit || 'Ilimitado'}
                    </span>
                  </div>
                  {currentPlan?.usage?.limit && (
                    <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${Math.min(((currentPlan?.usage?.dividas || 0) / currentPlan.usage.limit) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary-600 to-primary-800 border-none text-white flex flex-col justify-center">
              <h3 className="font-bold text-lg mb-2">Precisa de mais?</h3>
              <p className="text-primary-100 text-sm mb-6 leading-relaxed">
                Faça upgrade agora e destrave relatórios automáticos, devedores ilimitados e multi-usuários.
              </p>
            </Card>
          </div>
        )}

        <h3 className="text-white font-bold text-lg mt-8 mb-4">Planos Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'FREE',
              name: 'Bronze',
              price: 'Grátis',
              desc: 'Essencial para controle básico.',
              features: ['Até 5 dívidas', 'WhatsApp Direto', 'Dashboard Simples'],
            },
            {
              id: 'PRO',
              name: 'Prata',
              price: 'R$ 29,99/mês',
              desc: 'O motor do seu crescimento.',
              features: ['Dívidas Ilimitadas', 'Relatórios CSV', 'Projeção de Caixa', 'Suporte VIP'],
              tag: 'Recomendado'
            },
            {
              id: 'PREMIUM',
              name: 'Ouro',
              price: 'R$ 49,99/mês',
              desc: 'Para frotas e empresas.',
              features: ['Tudo do Prata', 'Multi-usuários', 'API Externa', 'Backup em Nuvem']
            }
          ].map((plan, i) => {
            const isCurrent = currentPlan?.name?.toUpperCase().includes(plan.name.toUpperCase()) || 
                              currentPlan?.tipo === plan.id;
            
            return (
              <Card key={i} className={`relative flex flex-col ${isCurrent ? 'border-primary-500/50 block' : ''}`}>
                {plan.tag && (
                  <div className="absolute -top-3 left-4 bg-primary-500 text-[10px] font-bold px-2 py-1 rounded text-white">
                    {plan.tag}
                  </div>
                )}
                <div className="mb-6 mt-2">
                  <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{plan.name}</h4>
                  <div className="text-2xl font-bold text-white">{plan.price}</div>
                </div>
                <p className="text-gray-500 text-xs mb-6 h-8">{plan.desc}</p>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-300">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={isCurrent ? 'secondary' : 'primary'} 
                  className="w-full" 
                  disabled={isCurrent || isCheckoutLoading !== null}
                  isLoading={isCheckoutLoading === plan.id}
                  onClick={() => handleCheckout(plan.id as any)}
                >
                  {isCurrent ? 'Seu Plano Atual' : (plan.id === 'FREE' ? 'Ativar Grátis' : 'Gerar PIX')}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Opcional: chamar fetchMyPlan() quando fechar, 
          // caso o webhook do backend já tenha processado no tempo do usuário fechar
        }}
        title="Pagamento via PIX"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <p className="text-gray-300 text-sm">
            Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o código Pix Copia e Cola.
            Seu plano será ativado automaticamente assim que o pagamento for confirmado pelo Mercado Pago.
          </p>

          {qrCodeData?.qrCodeBase64 && (
            <div className="bg-white p-2 rounded-xl mt-4">
              <img 
                src={qrCodeData.qrCodeBase64.startsWith('data:image') ? qrCodeData.qrCodeBase64 : `data:image/png;base64,${qrCodeData.qrCodeBase64}`} 
                alt="QR Code PIX" 
                className="w-48 h-48 object-contain"
              />
            </div>
          )}

          <div className="w-full mt-6">
            <p className="text-white font-medium text-sm text-left mb-2">Pix Copia e Cola</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={qrCodeData?.qrCode || ''} 
                readOnly 
                className="flex-1 bg-dark-500 border border-dark-400 text-gray-300 text-sm rounded-lg p-2.5 outline-none"
              />
              <Button variant="primary" onClick={copyToClipboard}>
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </Modal>

    </Layout>
  );
};
