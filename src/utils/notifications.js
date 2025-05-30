import { auth } from '@/config/firebase/firebaseAdmin';
import { POST as createNotification } from '@/app/api/notifications/route';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Funções utilitárias para envio de notificações
 */

// Obter a URL base da API
const getApiBaseUrl = () => {
  // Se estiver rodando no servidor, use a URL completa
  if (typeof window === 'undefined') {
    // Use uma variável de ambiente ou um valor padrão
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  }
  // Se estiver no cliente, use caminho relativo
  return '';
};

/**
 * Função base para enviar notificações
 */
export async function sendNotification({ userId, title, content, type = 'info' }) {
  console.log('[sendNotification] Iniciando envio de notificação:', { 
    userId, 
    title, 
    type,
    content: content.substring(0, 50) + '...' // Log parcial do conteúdo
  });
  
  try {
    console.log('[sendNotification] Criando request para o endpoint...');
    const request = new NextRequest('http://localhost:3000/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ userId, title, content, type })
    });

    console.log('[sendNotification] Chamando endpoint de notificações...');
    const response = await createNotification(request);
    
    if (!response.ok) {
      console.error('[sendNotification] Erro na resposta:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Falha ao enviar notificação: ${response.status}`);
    }

    const result = await response.json();
    console.log('[sendNotification] Notificação enviada com sucesso:', result);
    return result;
  } catch (error) {
    console.error('[sendNotification] Erro detalhado ao enviar notificação:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Envia uma notificação quando um desafio é concluído
 */
export async function sendGoalCompletedNotification({ userId, goalTitle, pointsEarned }) {
  return sendNotification({
    userId,
    title: 'Desafio Concluído!',
    content: `Parabéns! Você concluiu o desafio "${goalTitle}" e ganhou ${pointsEarned} pontos!`,
    type: 'success'
  });
}

/**
 * Notifica o usuário quando uma coleta é confirmada
 */
export async function sendCollectionConfirmedNotification({ userId, collectionDate, collectorName }) {
  const formattedDate = new Date(collectionDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return sendNotification({
    userId,
    title: 'Coleta Confirmada',
    content: `Sua coleta foi confirmada para ${formattedDate} com o responsável ${collectorName}.`,
    type: 'info'
  });
}

/**
 * Notifica o responsável quando uma coleta é cancelada pelo usuário
 */
export async function sendCollectionCanceledByUserNotification({ collectorId, userName, collectionDate }) {
  const formattedDate = new Date(collectionDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return sendNotification({
    userId: collectorId,
    title: 'Coleta Cancelada',
    content: `O usuário ${userName} cancelou a coleta agendada para ${formattedDate}.`,
    type: 'warning'
  });
}

/**
 * Notifica o usuário quando uma coleta é cancelada pelo responsável ou administrador
 */
export async function sendCollectionCanceledByCollectorNotification({ userId, collectorName, collectionDate }) {
  console.log('Iniciando envio de notificação de cancelamento pelo responsável:', {
    userId,
    collectorName,
    collectionDate
  });

  try {
    const formattedDate = new Date(collectionDate).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('Data formatada:', formattedDate);

    console.log('Preparando para enviar notificação com os dados:', {
      userId,
      title: 'Coleta Cancelada',
      content: `O responsável ${collectorName} cancelou a coleta agendada para ${formattedDate}.`,
      type: 'warning'
    });

    const result = await sendNotification({
      userId,
      title: 'Coleta Cancelada',
      content: `O responsável ${collectorName} cancelou a coleta agendada para ${formattedDate}.`,
      type: 'warning'
    });

    console.log('Notificação de cancelamento enviada com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao enviar notificação de cancelamento:', {
      error: error.message,
      stack: error.stack,
      dados: {
        userId,
        collectorName,
        collectionDate
      }
    });
    throw error;
  }
}

/**
 * Notifica o usuário quando uma coleta é realizada
 */
export async function sendCollectionCompletedNotification({ userId, collectionDate }) {
  const formattedDate = new Date(collectionDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return sendNotification({
    userId,
    title: 'Coleta Realizada',
    content: `Sua coleta agendada para ${formattedDate} foi realizada com sucesso! Obrigado por contribuir com o meio ambiente.`,
    type: 'success'
  });
}

/**
 * Notifica o responsável quando uma nova coleta é agendada
 */
export async function sendNewCollectionScheduledNotification({ collectorId, userName, collectionDate, ecoPointName }) {
  console.log('Preparando notificação de nova coleta:', {
    collectorId,
    userName,
    collectionDate,
    ecoPointName
  });

  return sendNotification({
    userId: collectorId,
    title: 'Nova Coleta Agendada',
    content: `${userName} agendou uma nova coleta para ${new Date(collectionDate).toLocaleString('pt-BR')} no eco ponto ${ecoPointName}.`,
    type: 'info'
  });
}

/**
 * Envia uma notificação quando uma nova meta está disponível
 */
export async function sendNewGoalAvailableNotification({ userId, goalTitle }) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        title: 'Nova Meta Disponível!',
        content: `Uma nova meta "${goalTitle}" está disponível para você participar!`,
        type: 'info'
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar notificação');
    }
  } catch (error) {
    console.error('Erro ao enviar notificação de nova meta:', error);
  }
} 