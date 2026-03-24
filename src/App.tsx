import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { DashboardPage } from './pages/DashboardPage';
import { DebtListPage } from './pages/DebtListPage';
import { NewDebtPage } from './pages/NewDebtPage';
import { EditDebtPage } from './pages/EditDebtPage';
import { DebtDetailPage } from './pages/DebtDetailPage';
import { ClientListPage } from './pages/ClientListPage';
import { NewClientPage } from './pages/NewClientPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { InstallBanner } from './components/ui/InstallBanner';
import { checkAndSendReminders } from './services/reminderService';
import { autoMarkOverdue, updateAllCurrentValues } from './db/hooks/useDividas';
import { initConfiguracoes } from './db/hooks/useConfiguracoes';
import './App.css';

function App() {
  useEffect(() => {
    // On app load: auto-mark overdue, refresh values, check reminders
    autoMarkOverdue();
    updateAllCurrentValues();
    checkAndSendReminders();
    initConfiguracoes();

    const interval = setInterval(() => {
      checkAndSendReminders();
    }, 30 * 60 * 1000);

    // Auto update expired routines frequently (every 10 seconds)
    const activeUpdateInterval = setInterval(() => {
      autoMarkOverdue();
      updateAllCurrentValues();
    }, 10 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(activeUpdateInterval);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dividas" element={<DebtListPage />} />
        <Route path="/dividas/nova" element={<NewDebtPage />} />
        <Route path="/dividas/:id" element={<DebtDetailPage />} />
        <Route path="/dividas/:id/editar" element={<EditDebtPage />} />
        <Route path="/clientes" element={<ClientListPage />} />
        <Route path="/clientes/novo" element={<NewClientPage />} />
        <Route path="/clientes/:id" element={<ClientDetailPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Routes>
      <InstallBanner />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
