import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import Collection from '@/models/collection';
import User from '@/models/user';
import connectToDB from '@/lib/db';
import {
  sendCollectionConfirmedNotification,
  sendCollectionCanceledByUserNotification,
  sendCollectionCanceledByCollectorNotification,
  sendCollectionCompletedNotification
} from '@/utils/notifications';

// Função auxiliar para verificar o token do Firebase
async function verifyFirebaseToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

// Atualizar status da coleta
export async function PUT(request, { params }) {
  try {
    await connectToDB();

    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { status } = data;
    const collectionId = params.id;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return NextResponse.json({ message: 'Coleta não encontrada' }, { status: 404 });
    }

    // Buscar informações do usuário e do responsável
    const [user, collector] = await Promise.all([
      User.findOne({ uid: collection.userId }),
      User.findOne({ uid: collection.collectorId })
    ]);

    if (!user || !collector) {
      return NextResponse.json({ message: 'Usuário ou responsável não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    const isAdmin = decodedToken.admin === true;
    const isCollector = decodedToken.uid === collection.collectorId;
    const isUser = decodedToken.uid === collection.userId;

    if (!isAdmin && !isCollector && !isUser) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    const oldStatus = collection.status;
    collection.status = status;
    await collection.save();

    console.log('Atualizando status da coleta:', {
      oldStatus,
      newStatus: status,
      userId: user.uid,
      collectorId: collector.uid
    });

    // Enviar notificações baseadas na mudança de status
    try {
      if (oldStatus === 'pending' && status === 'confirmed') {
        // Coleta confirmada
        console.log('Enviando notificação de confirmação de coleta');
        await sendCollectionConfirmedNotification({
          userId: user.uid,
          collectionDate: collection.scheduledDate,
          collectorName: collector.name
        });
      } else if (status === 'canceled') {
        // Coleta cancelada
        if (isUser) {
          // Cancelada pelo usuário
          console.log('Enviando notificação de cancelamento pelo usuário');
          await sendCollectionCanceledByUserNotification({
            collectorId: collector.uid,
            userName: user.name,
            collectionDate: collection.scheduledDate
          });
        } else {
          // Cancelada pelo responsável ou admin
          console.log('Enviando notificação de cancelamento pelo responsável');
          await sendCollectionCanceledByCollectorNotification({
            userId: user.uid,
            collectorName: collector.name,
            collectionDate: collection.scheduledDate
          });
        }
      } else if (status === 'completed') {
        // Coleta realizada
        console.log('Enviando notificação de coleta realizada');
        await sendCollectionCompletedNotification({
          userId: user.uid,
          collectionDate: collection.scheduledDate
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      // Não retornamos erro aqui para não afetar a atualização do status
    }

    return NextResponse.json({ message: 'Status da coleta atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status da coleta:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar status da coleta' },
      { status: 500 }
    );
  }
} 