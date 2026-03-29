import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-white selection:bg-primary-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              DebtTracker <span className="text-primary-500 text-sm font-medium">SAAS</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Preços</a>
            <Link to="/dashboard">
              <Button variant="primary" size="md">Entrar no App</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/20 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-400 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Novo: Exportação em CSV e Fluxo de Caixa
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Recupere seu dinheiro com <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400 italic">inteligência</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            O DebtTracker automatiza suas cobranças por WhatsApp, projeta seu fluxo de caixa e gerencia seus devedores com facilidade. Do MEI ao empresário Pro.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="h-14 px-10 text-lg">Começar Gratuitamente</Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-14 px-10 text-lg text-gray-300">Ver Demo</Button>
          </div>

          {/* App Preview Mockup */}
          <div className="mt-12 md:mt-20 relative px-4 flex justify-center">
            <div className="max-w-3xl w-full bg-dark-800 rounded-3xl p-1.5 md:p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              <div className="bg-dark-900 rounded-[1.25rem] border border-white/5 overflow-hidden ring-1 ring-white/5">
                <img 
                  src="/src/assets/dashboard-preview.png" 
                  alt="Interface do Dashboard" 
                  className="w-full h-auto object-cover opacity-95"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo o que você precisa para cobrar melhor</h2>
            <p className="text-gray-400">Funcionalidades pensadas para quem não quer perder tempo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'WhatsApp em 1 Clique',
                desc: 'Envie cobranças personalizadas direto pelo WhatsApp com o valor atualizado e juros calculados.',
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              },
              {
                title: 'Juros Automáticos',
                desc: 'Juros simples, compostos ou fixos. O sistema atualiza o valor da dívida em tempo real todos os dias.',
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                title: 'Gestão de CRM',
                desc: 'Base de clientes estruturada. Saiba exatamente quem são seus melhores e piores pagadores.',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-colors group">
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-6 border border-primary-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos que cabem no seu bolso</h2>
            <p className="text-gray-400">Escolha o nível que melhor atende sua necessidade atual.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bronze/Free */}
            <div className="p-8 rounded-3xl bg-dark-800 border border-white/5 flex flex-col h-full hover:translate-y-[-8px] transition-transform duration-300">
              <h3 className="text-lg font-bold mb-2">Gratuito (Bronze)</h3>
              <p className="text-gray-400 text-sm mb-6">Para quem está começando a organizar as contas.</p>
              <div className="text-4xl font-bold mb-8">R$ 0<span className="text-sm font-normal text-gray-500">/mês</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Até 5 dívidas ativas
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Calculadora de Juros
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Cobrança via WhatsApp
                </li>
              </ul>
              
              <Button variant="secondary" size="lg" className="w-full">Começar agora</Button>
            </div>

            {/* Silver/Pro - POPULAR */}
            <div className="p-8 rounded-3xl bg-primary-600/10 border-2 border-primary-500 flex flex-col h-full relative overflow-hidden transform md:scale-105 shadow-2xl shadow-primary-500/10">
              <div className="absolute top-4 right-4 bg-primary-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">MAIS POPULAR</div>
              <h3 className="text-lg font-bold mb-2 text-primary-400">Profissional (Prata)</h3>
              <p className="text-gray-300 text-sm mb-6">Ideal para pequenos negócios e prestadores de serviço.</p>
              <div className="text-4xl font-bold mb-8">R$ 29,90<span className="text-sm font-normal text-gray-400">/mês</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-white">
                  <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Dívidas Ilimitadas
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Exportação de Relatórios (CSV)
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Fluxo de Caixa Projetado
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Suporte Prioritário
                </li>
              </ul>
              
              <Button variant="primary" size="lg" className="w-full h-14 shadow-lg shadow-primary-500/40">Assinar agora</Button>
            </div>

            {/* Gold/Business */}
            <div className="p-8 rounded-3xl bg-dark-800 border border-white/5 flex flex-col h-full hover:translate-y-[-8px] transition-transform duration-300">
              <h3 className="text-lg font-bold mb-2">Empresarial (Ouro)</h3>
              <p className="text-gray-400 text-sm mb-6">Para empresas que precisam de controle total.</p>
              <div className="text-4xl font-bold mb-8">R$ 59,90<span className="text-sm font-normal text-gray-500">/mês</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Tudo do plano Prata
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Multi-usuários (Equipe)
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  API para Integração Externa
                </li>
              </ul>
              
              <Button variant="secondary" size="lg" className="w-full">Fale conosco</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-4 text-gray-500 text-sm">
          <p>© 2026 DebtTracker SAAS. Desenvolvido com foco em resultados.</p>
        </div>
      </footer>
    </div>
  );
};
