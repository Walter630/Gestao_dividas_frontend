import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { toast } from 'sonner';

import { useAllDividas } from '../db/hooks/useDividas';

export const SubscriptionPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const allDividas = useAllDividas();
  const _totalDividas = allDividas ? allDividas.length : 0;

  // States para o checkout e Modal do QR Code Pier
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ qrCode: string; qrCodeBase64?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<'FREE' | 'PRO' | 'PREMIUM' | null>(null);

  const fetchMyPlan = async () => {
    try {
      const response = await api.get('/subscription/my-plan');
      console.log('DEBUG: Plano recebido do Backend:', response.data);
      setCurrentPlan(response.data);
    } catch (error: any) {
      console.error('Falha ao buscar plano', error);
      // Fallback para o plano Bronze (FREE)
      setCurrentPlan({
        name: 'Bronze',
        tipo: 'FREE',
        status: 'Ativo (Padrão)',
        renewsAt: 'Vitalício',
        usage: { dividas: 0, limit: 5 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPlan();
  }, []);

  const initiateCheckout = (planId: 'FREE' | 'PRO' | 'PREMIUM') => {
    setSelectedPlanId(planId);
    if (planId === 'FREE') {
      handleCheckout(planId);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handleCheckout = async (planType: 'FREE' | 'PRO' | 'PREMIUM') => {
    setIsConfirmModalOpen(false);
    setIsCheckoutLoading(planType);
    try {
      if (planType === 'FREE') {
        toast.success('Plano Gratuito ativado com sucesso!');
        fetchMyPlan();
      } else {
        const response = await api.post(`/subscription/checkout/${planType}`);
        const base64 = response.data?.qrCodeBase64 || response.data?.image || response.data?.imagem || response.data?.qrCode;
        setQrCodeData({
          qrCode: response.data?.payload || response.data?.chavePix || response.data?.qrCode || 'Código PIX Indisponível',
          qrCodeBase64: base64 || null
        });
        setIsModalOpen(true);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error(`Erro 404: A rota para assinar o plano ${planType} não existe no backend!`, { duration: 5000 });
      } else {
        toast.error(error.response?.data?.message || 'Erro ao gerar checkout do plano.');
      }
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
                      {currentPlan?.planName || currentPlan?.plan || currentPlan?.tipo || currentPlan?.name || 'Bronze'}
                    </span>
                    <span className="text-gray-500 text-xs text-uppercase">{currentPlan?.active ? 'Ativo' : (currentPlan?.status || 'Inativo')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Próxima renovação</p>
                  <p className="text-white font-medium">{currentPlan?.expiresAt || currentPlan?.renewsAt || currentPlan?.dataExpiracao || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Limite de Dívidas</span>
                    <span className="text-white font-medium">
                      {currentPlan?.usage?.dividas || _totalDividas} / {currentPlan?.usage?.limit || (currentPlan?.plan === 'FREE' || currentPlan?.tipo === 'FREE' ? 5 : 'Ilimitado')}
                    </span>
                  </div>
                  {(currentPlan?.usage?.limit || currentPlan?.plan === 'FREE' || currentPlan?.tipo === 'FREE') && (
                    <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${Math.min((((currentPlan?.usage?.dividas || _totalDividas) / (currentPlan?.usage?.limit || 5)) * 100), 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Limite de Cartões</span>
                    <span className="text-white font-medium">
                      {currentPlan?.usage?.cards || 0} / {currentPlan?.usage?.cardLimit || (currentPlan?.plan === 'FREE' || currentPlan?.tipo === 'FREE' ? 2 : 'Ilimitado')}
                    </span>
                  </div>
                  {(currentPlan?.usage?.cardLimit || (currentPlan?.plan === 'FREE' || currentPlan?.tipo === 'FREE')) && (
                    <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(((currentPlan?.usage?.cards || 0) / (currentPlan?.usage?.cardLimit || 2)) * 100, 100)}%` }}
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
              name: 'Gratuito',
              price: 'R$ 0,00',
              desc: 'Essencial para controle básico pessoal.',
              features: ['Até 5 dívidas ativas', 'Até 2 Cartões de Crédito', 'WhatsApp Direto (Manual)', 'Dashboard Simples'],
            },
            {
              id: 'PRO',
              name: 'Profissional',
              price: 'R$ 29,90/mês',
              desc: 'O motor do seu crescimento financeiro.',
              features: ['Dívidas Ilimitadas', 'Cartões Ilimitados', 'Relatórios CSV/PDF', 'Projeção de Caixa', 'Suporte Prioritário'],
              tag: 'Recomendado'
            },
            {
              id: 'PREMIUM',
              name: 'Business',
              price: 'R$ 59,90/mês',
              desc: 'Gestão completa para pequenas empresas.',
              features: ['Tudo do PRO', 'Multi-usuários (Até 5)', 'Alertas via WhatsApp', 'Logo da Empresa em Relatórios']
            }
          ].map((plan, i) => {
            // Garante que só seja selecionado se não for o plano fallback
            const isFallback = currentPlan?.name === 'Não Encontrado';

            // Verificação robusta: checa tipo, name e planName em caixa alta
            const isCurrent = !isFallback && (
              currentPlan?.tipo === plan.id ||
              currentPlan?.name?.toUpperCase() === plan.name.toUpperCase() ||
              currentPlan?.planName?.toUpperCase() === plan.name.toUpperCase()
            );

            return (
              <Card
                key={i}
                className={`relative flex flex-col transition-all duration-300 ${isCurrent ? 'border-primary-500/50 block scale-105 shadow-glow z-10' : 'hover:-translate-y-2 hover:border-primary-500/30'} ${(!isCurrent || plan.id === 'FREE') && 'cursor-default'} ${plan.id === 'FREE' && 'opacity-60 grayscale-[0.5]'} `}
              >
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
                  variant={isCurrent || plan.id === 'FREE' ? 'secondary' : 'primary'}
                  className="w-full mt-auto"
                  disabled={isCurrent || plan.id === 'FREE' || isCheckoutLoading !== null}
                  loading={isCheckoutLoading === plan.id}
                  onClick={() => initiateCheckout(plan.id as any)}
                >
                  {isCurrent ? 'Seu Plano Atual' : (plan.id === 'FREE' ? 'Plano Padrão' : 'Gerar PIX')}
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

      {/* Modal de Confirmação antes de gerar o PIX */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Pedido"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-2">Você está prestes a gerar um código PIX para o plano:</p>
            <h4 className="text-white text-xl font-bold">
              {selectedPlanId === 'PRO' ? 'Profissional (PRO)' : 'Empresarial (PREMIUM)'}
            </h4>
          </div>
          <p className="text-xs text-gray-500">
            Ao clicar em "Confirmar", uma ordem de pagamento será criada no seu nome e as instruções do PIX serão geradas.
          </p>
          <div className="flex gap-4 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => handleCheckout(selectedPlanId!)}>
              Confirmar e Gerar
            </Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
};
