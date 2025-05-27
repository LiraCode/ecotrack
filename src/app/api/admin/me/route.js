import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import connectToDB from '@/lib/db';
import Admin from '@/models/admin';

export async function GET(request) {
  try {
    // Verificar token do Firebase
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Conectar ao banco de dados
    await connectToDB();

    // Buscar admin pelo firebaseId
    const admin = await Admin.findOne({ firebaseId: decodedToken.uid });

    if (!admin) {
      return NextResponse.json({ message: 'Usuário não é administrador' }, { status: 404 });
    }

    // Retornar dados do admin (exceto informações sensíveis)
    return NextResponse.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    });

  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return NextResponse.json(
      { message: 'Erro ao verificar status de administrador' },
      { status: 500 }
    );
  }
} 