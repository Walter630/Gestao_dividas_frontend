import { db } from '../db/db';
import { StatusDivida } from '../db/types';
import { markReminderSent } from '../db/hooks/useDividas';
import { addDays, isBefore, isAfter } from 'date-fns';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function checkAndSendReminders(): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  const now = new Date();
  const threeDaysFromNow = addDays(now, 3);

  const pendingDividas = await db.dividas
    .where('status')
    .anyOf([StatusDivida.PENDENTE, StatusDivida.NEGOCIANDO])
    .toArray();

  for (const divida of pendingDividas) {
    const dueDate = new Date(divida.dataVencimento);

    // Skip if already reminded in the last 24h
    if (divida.lembreteEnviado) {
      const lastReminder = new Date(divida.lembreteEnviado);
      const hoursSinceReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60);
      if (hoursSinceReminder < 24) continue;
    }

    // Send reminder if due within 3 days or already overdue
    const isDueSoon = isBefore(dueDate, threeDaysFromNow) && isAfter(dueDate, now);
    const isOverdue = isBefore(dueDate, now);

    if (isDueSoon || isOverdue) {
      const title = isOverdue
        ? `⚠️ Dívida Vencida: ${divida.devedorNome}`
        : `🔔 Dívida Vencendo em Breve: ${divida.devedorNome}`;

      const body = isOverdue
        ? `A dívida de ${divida.devedorNome} venceu em ${new Date(divida.dataVencimento).toLocaleDateString('pt-BR')}. Valor atual: R$ ${divida.valorAtual.toFixed(2)}`
        : `A dívida de ${divida.devedorNome} vence em ${new Date(divida.dataVencimento).toLocaleDateString('pt-BR')}. Valor: R$ ${divida.valorAtual.toFixed(2)}`;

      if (hasPermission) {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `debt-reminder-${divida.id}`,
        });
      }

      await markReminderSent(divida.id!);
    }
  }
}

