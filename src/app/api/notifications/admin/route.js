import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDB from '@/lib/db';
import User from '@/models/user';
import '@/models/responsable';
import '@/models/admin';
import '@/models/notification';
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

// Função para buscar usuários por grupo
async function buscarUsuariosPorGrupo(grupo) {
  switch (grupo) {
    case 'usuarios':
      return User.find().select('firebaseId');
    case 'responsaveis':
      return mongoose.model('Responsable').find().select('firebaseId');
    case 'administradores':
      return mongoose.model('Admin').find().select('firebaseId');
    case 'todos':
      const [usuarios, responsaveis, admins] = await Promise.all([
        User.find().select('firebaseId'),
        mongoose.model('Responsable').find().select('firebaseId'),
        mongoose.model('Admin').find().select('firebaseId')
      ]);
      return [...usuarios, ...responsaveis, ...admins];
    default:
      throw new Error('Grupo inválido');
  }
}

// Função para enviar uma notificação
async function enviarNotificacao({ userId, title, content, type }) {
  try {
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      userId,
      title,
      content,
      type,
      read: false,
      createdAt: new Date()
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Erro ao salvar notificação:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    await connectToDB();

    // Verificar se o usuário é administrador
    const admin = await mongoose.model('Admin').findOne({ firebaseId: decodedToken.uid });
    if (!admin) {
      return NextResponse.json(
        { message: 'Apenas administradores podem enviar notificações' },
        { status: 403 }
      );
    }

    const { tipoDestinatario, destinatario, titulo, conteudo, tipo } = await request.json();

    let destinatarios = [];

    // Buscar destinatários
    if (tipoDestinatario === 'grupo') {
      const usuarios = await buscarUsuariosPorGrupo(destinatario);
      destinatarios = usuarios.map(u => u.firebaseId);
    } else {
      destinatarios = [destinatario];
    }

    // Enviar notificações
    const promises = destinatarios.map(userId =>
      enviarNotificacao({
        userId,
        title: titulo,
        content: conteudo,
        type: tipo
      })
    );

    await Promise.all(promises);

    return NextResponse.json({
      message: 'Notificações enviadas com sucesso',
      totalEnviadas: destinatarios.length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { message: 'Erro ao enviar notificações', error: error.message },
      { status: 500 }
    );
  }
} 