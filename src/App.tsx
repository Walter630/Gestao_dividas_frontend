import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DebtListPage } from './pages/DebtListPage';
import { NewDebtPage } from './pages/NewDebtPage';
import { EditDebtPage } from './pages/EditDebtPage';
import { DebtDetailPage } from './pages/DebtDetailPage';
import { ClientListPage } from './pages/ClientListPage';
import { NewClientPage } from './pages/NewClientPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ProfilePage } from './pages/ProfilePage';
import { CardListPage } from './pages/cards/CardListPage';
import { NewCardPage } from './pages/cards/NewCardPage';
import { NewPurchasePage } from './pages/cards/NewPurchasePage';
import { CardDetailPage } from './pages/cards/CardDetailPage';
import { PurchaseDetailPage } from './pages/cards/PurchaseDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { InstallBanner } from './components/ui/InstallBanner';
import './App.css';

function App() {
  useEffect(() => {
    // Com a migração para API Rest, algumas lógicas locais como "autoMarkOverdue" 
    // ou "checkAndSendReminders" deverão ser transferidas para processos/cron no backend.
    // As chamadas originais ao Dexie foram removidas.
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dividas" element={<DebtListPage />} />
          <Route path="/dividas/nova" element={<NewDebtPage />} />
          <Route path="/dividas/:id" element={<DebtDetailPage />} />
          <Route path="/dividas/:id/editar" element={<EditDebtPage />} />
          <Route path="/clientes" element={<ClientListPage />} />
          <Route path="/clientes/novo" element={<NewClientPage />} />
          <Route path="/clientes/:id" element={<ClientDetailPage />} />
          
          {/* Rotas de Cartões */}
          <Route path="/cartoes" element={<CardListPage />} />
          <Route path="/cartoes/novo" element={<NewCardPage />} />
          <Route path="/cartoes/:id" element={<CardDetailPage />} />
          <Route path="/cartoes/compra/nova" element={<NewPurchasePage />} />
          <Route path="/cartoes/compra/:id" element={<PurchaseDetailPage />} />

          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/assinatura" element={<SubscriptionPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
      <InstallBanner />
    </BrowserRouter>
  );
}

export default App;
