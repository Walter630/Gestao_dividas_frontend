import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { DebtListPage } from './pages/DebtListPage';
import { NewDebtPage } from './pages/NewDebtPage';
import { EditDebtPage } from './pages/EditDebtPage';
import { DebtDetailPage } from './pages/DebtDetailPage';
import { InstallBanner } from './components/ui/InstallBanner';
import { checkAndSendReminders } from './services/reminderService';
import { autoMarkOverdue, updateAllCurrentValues } from './db/hooks/useDividas';
import './App.css';

function App() {
  useEffect(() => {
    // On app load: auto-mark overdue, refresh values, check reminders
    autoMarkOverdue();
    updateAllCurrentValues();
    checkAndSendReminders();

    // Re-check reminders every 30 minutes
    const interval = setInterval(() => {
      checkAndSendReminders();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dividas" element={<DebtListPage />} />
        <Route path="/dividas/nova" element={<NewDebtPage />} />
        <Route path="/dividas/:id" element={<DebtDetailPage />} />
        <Route path="/dividas/:id/editar" element={<EditDebtPage />} />
      </Routes>
      <InstallBanner />
    </BrowserRouter>
  );
}

export default App;
