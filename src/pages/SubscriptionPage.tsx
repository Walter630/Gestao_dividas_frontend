import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SubscriptionPage: React.FC = () => {
  // Mock data for current plan
  const currentPlan = {
    name: 'Essencial (Bronze)',
    status: 'Ativo',
    renewsAt: 'N/A (Gratuito)',
    usage: {
      dividas: 3,
      limit: 5
    }
  };

  return (
    <Layout>
      <Topbar 
        title="Meu Plano" 
        subtitle="Gerencie sua assinatura e limites do sistema" 
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Seu Plano Atual</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-bold rounded uppercase">
                    {currentPlan.name}
                  </span>
                  <span className="text-gray-500 text-xs">Ativo desde 15/03/2026</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs mb-1">Próxima renovação</p>
                <p className="text-white font-medium">{currentPlan.renewsAt}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Limite de Dívidas Ativas</span>
                  <span className="text-white font-medium">{currentPlan.usage.dividas} / {currentPlan.usage.limit}</span>
                </div>
                <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full" 
                    style={{ width: `${(currentPlan.usage.dividas / currentPlan.usage.limit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 border-none text-white">
            <h3 className="font-bold text-lg mb-2">Precisa de mais?</h3>
            <p className="text-primary-100 text-sm mb-6 leading-relaxed">
              O plano **Prata** oferece dívidas ilimitadas, relatórios CSV e projeção de fluxo de caixa.
            </p>
            <Button variant="secondary" className="w-full bg-white text-primary-700 hover:bg-gray-100 border-none">
              Ver Planos
            </Button>
          </Card>
        </div>

        {/* Plan Comparison List */}
        <h3 className="text-white font-bold text-lg mt-8">Planos Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Bronze',
              price: 'Grátis',
              desc: 'Essencial para controle básico.',
              features: ['Até 5 dívidas', 'WhatsApp Direto', 'Dashboard Simples'],
              current: true
            },
            {
              name: 'Prata',
              price: 'R$ 29,90/mês',
              desc: 'O motor do seu crescimento.',
              features: ['Dívidas Ilimitadas', 'Relatórios CSV', 'Projeção de Caixa', 'Suporte VIP'],
              tag: 'Recomendado'
            },
            {
              name: 'Ouro',
              price: 'R$ 59,90/mês',
              desc: 'Para frotas e empresas.',
              features: ['Tudo do Prata', 'Multi-usuários', 'API Externa', 'Backup em Nuvem']
            }
          ].map((plan, i) => (
            <Card key={i} className={`relative flex flex-col ${plan.current ? 'border-primary-500/50' : ''}`}>
              {plan.tag && (
                <div className="absolute -top-3 left-4 bg-primary-500 text-[10px] font-bold px-2 py-1 rounded">
                  {plan.tag}
                </div>
              )}
              <div className="mb-6">
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
                variant={plan.current ? 'secondary' : 'primary'} 
                className="w-full" 
                disabled={plan.current}
              >
                {plan.current ? 'Seu Plano Atual' : 'Fazer Upgrade'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
