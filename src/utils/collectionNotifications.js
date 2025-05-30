import { sendNotification } from './notifications';
import { formatDate } from './dateUtils';

/**
 * Envia notificação quando uma coleta é confirmada
 */
export async function sendCollectionConfirmedNotification({ userId, collectionDate, collectorName }) {
  return sendNotification({
    userId,
    title: 'Coleta Confirmada',
    content: `Sua coleta agendada para ${formatDate(collectionDate)} foi confirmada por ${collectorName}.`,
    type: 'info'
  });
}

/**
 * Envia notificação quando uma coleta é cancelada pelo usuário
 */
export async function sendCollectionCanceledByUserNotification({ collectorId, userName, collectionDate }) {
  return sendNotification({
    userId: collectorId,
    title: 'Coleta Cancelada pelo Usuário',
    content: `A coleta agendada para ${formatDate(collectionDate)} foi cancelada por ${userName}.`,
    type: 'warning'
  });
}

/**
 * Envia notificação quando uma coleta é cancelada pelo responsável/admin
 */
export async function sendCollectionCanceledByCollectorNotification({ userId, collectorName, collectionDate }) {
  return sendNotification({
    userId,
    title: 'Coleta Cancelada',
    content: `Sua coleta agendada para ${formatDate(collectionDate)} foi cancelada por ${collectorName}.`,
    type: 'warning'
  });
}

/**
 * Envia notificação quando uma coleta é realizada
 */
export async function sendCollectionCompletedNotification({ userId, collectionDate }) {
  return sendNotification({
    userId,
    title: 'Coleta Realizada',
    content: `Sua coleta agendada para ${formatDate(collectionDate)} foi realizada com sucesso.`,
    type: 'success'
  });
}

/**
 * Envia notificação quando uma nova coleta é agendada
 */
export async function sendNewCollectionScheduledNotification({ collectorId, userName, collectionDate, address }) {
  return sendNotification({
    userId: collectorId,
    title: 'Nova Coleta Agendada',
    content: `${userName} agendou uma nova coleta para ${formatDate(collectionDate)} no endereço: ${address}.`,
    type: 'info'
  });
} 