import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Notification from '@/models/notification';
import { auth } from '@/config/firebase/firebaseAdmin';

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

// Marcar notificações como lidas
export async function PUT(request) {
  try {
    await connectToDB();

    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Marcar todas as notificações não lidas do usuário como lidas
    const result = await Notification.updateMany(
      { 
        userId: decodedToken.uid,
        read: false
      },
      { 
        $set: { read: true }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Nenhuma notificação para marcar como lida' });
    }

    return NextResponse.json({ 
      message: 'Notificações marcadas como lidas',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    return NextResponse.json(
      { message: 'Erro ao marcar notificações como lidas' },
      { status: 500 }
    );
  }
} 