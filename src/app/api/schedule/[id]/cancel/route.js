import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import User from '@/models/user';
import { sendCollectionCanceledByCollectorNotification } from '@/utils/notifications';

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

export async function PUT(request, { params }) {
  try {
    console.log('Iniciando cancelamento de agendamento...');
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Extrair o ID do parâmetro de rota
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID de agendamento inválido' },
        { status: 400 }
      );
    }

    // Buscar o agendamento para verificar se existe e se já está cancelado
    const schedule = await CollectionScheduling.findById(id)
      .populate('userId')
      .populate('collectionPointId');
    
    if (!schedule) {
      console.error('Agendamento não encontrado');
      return NextResponse.json(
        { message: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    if (schedule.status === 'Cancelado') {
      console.error('Agendamento já está cancelado');
      return NextResponse.json(
        { message: 'Agendamento já está cancelado' },
        { status: 400 }
      );
    }

    // Buscar informações do responsável que está cancelando
    console.log('Buscando informações do responsável...');
    const responsible = await User.findOne({ firebaseId: decodedToken.uid });
    if (!responsible) {
      console.error('Responsável não encontrado:', decodedToken.uid);
      return NextResponse.json({ message: 'Responsável não encontrado' }, { status: 404 });
    }
    
    // Atualizar o agendamento para cancelado
    schedule.status = 'Cancelado';
    schedule.canceledAt = new Date();
    await schedule.save();
    
    // Enviar notificação para o usuário
    console.log('Enviando notificação de cancelamento para o usuário:', {
      userId: schedule.userId.firebaseId,
      collectorName: responsible.name,
      collectionDate: schedule.date
    });

    await sendCollectionCanceledByCollectorNotification({
      userId: schedule.userId.firebaseId,
      collectorName: responsible.name,
      collectionDate: schedule.date
    });
    
    // Responder com sucesso
    console.log('Agendamento cancelado com sucesso');
    return NextResponse.json({ 
      success: true, 
      message: 'Agendamento cancelado com sucesso',
      schedulingId: id
    });
    
  } catch (error) {
    console.error('Error canceling schedule:', error);
    return NextResponse.json(
      { message: 'Erro ao cancelar agendamento', error: error.message },
      { status: 500 }
    );
  }
}
