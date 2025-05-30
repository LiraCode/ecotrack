import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Notification from '@/models/notification';
import { auth } from '@/config/firebase/firebaseAdmin';

// Função auxiliar para verificar o token do Firebase
async function verifyFirebaseToken(req) {
  //console.log('Verificando token do Firebase...');
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Requisição sem token - permitindo pois pode ser do servidor');
      return { isServer: true };
    }

    const token = authHeader.split('Bearer ')[1];
    //console.log('Decodificando token...');
    const decodedToken = await auth.verifyIdToken(token);
    //console.log('Token decodificado com sucesso:', { uid: decodedToken.uid });
    return decodedToken;
  } catch (error) {
    console.error('Erro ao verificar token Firebase:', {
      error: error.message,
      stack: error.stack
    });
    return null;
  }
}

// Buscar notificações do usuário
export async function GET(request) {
  try {
    await connectToDB();

    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Buscar notificações do usuário, ordenadas por data (mais recentes primeiro)
    const notifications = await Notification.find({ 
      userId: decodedToken.uid 
    })
    .sort({ createdAt: -1 })
    .limit(20); // Limitar a 20 notificações mais recentes

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar notificações', error: error.message },
      { status: 500 }
    );
  }
}

// Criar nova notificação
export async function POST(request) {
  console.log('Recebendo requisição POST para criar notificação');
  try {
    //console.log('Conectando ao banco de dados...');
    await connectToDB();
    //console.log('Conectado ao banco de dados');

    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      console.error('Token inválido');
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    // console.log('Dados recebidos:', {
    //   ...data,
    //   content: data.content?.substring(0, 50) + '...' // Log parcial do conteúdo
    // });

    const { userId, title, content, type = 'info' } = data;

    // Validar dados obrigatórios
    if (!userId || !title || !content) {
      console.error('Dados incompletos:', { userId, title, hasContent: !!content });
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Se a requisição veio do servidor, permitir. Caso contrário, verificar permissões
    if (!decodedToken.isServer) {
      const isAdmin = decodedToken.admin === true;
      if (userId !== decodedToken.uid && !isAdmin) {
        console.error('Usuário não autorizado:', {
          requestingUid: decodedToken.uid,
          targetUid: userId,
          isAdmin
        });
        return NextResponse.json(
          { message: 'Não autorizado a enviar notificações para outros usuários' },
          { status: 403 }
        );
      }
    }

    //console.log('Criando notificação no banco de dados...');
    // Criar notificação
    const notification = await Notification.create({
      userId,
      title,
      content,
      type,
      read: false
    });

    // console.log('Notificação criada com sucesso:', {
    //   id: notification._id,
    //   userId: notification.userId,
    //   title: notification.title
    // });

    return NextResponse.json(
      { message: 'Notificação criada com sucesso', notification },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro detalhado ao criar notificação:', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Erro ao criar notificação', error: error.message },
      { status: 500 }
    );
  }
} 