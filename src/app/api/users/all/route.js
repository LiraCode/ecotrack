import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDB from '@/lib/db';
import User from '@/models/user';
import '@/models/responsable';
import '@/models/admin';
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

export async function GET(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    await connectToDB();

    // Buscar usuários de todas as coleções
    const [usuarios, responsaveis, administradores] = await Promise.all([
      User.find().select('name firebaseId role').lean(),
      mongoose.model('Responsable').find().select('name firebaseId').lean(),
      mongoose.model('Admin').find().select('name firebaseId').lean(),
    ]);

    // Formatar responsáveis e administradores para incluir o role
    const usuariosFormatados = usuarios.map(u => ({
      ...u,
      role: 'Usuario'  // Forçar o role para 'Usuario' na resposta
    }));

    const responsaveisFormatados = responsaveis.map(r => ({
      ...r,
      role: 'Responsavel'
    }));

    const administradoresFormatados = administradores.map(a => ({
      ...a,
      role: 'Administrador'
    }));

    // Combinar todos os usuários
    const todosUsuarios = [
      ...usuariosFormatados,
      ...responsaveisFormatados,
      ...administradoresFormatados
    ];

    return NextResponse.json(todosUsuarios);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar usuários', error: error.message },
      { status: 500 }
    );
  }
} 