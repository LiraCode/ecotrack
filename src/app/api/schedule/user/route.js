import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import User from '@/models/user';
import { NextResponse } from 'next/server';
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

// GET - Buscar agendamentos do usuário atual
export async function GET(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar o usuário para obter o ID do MongoDB
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Construir filtro de consulta
    const query = { clientId: user._id };
    
    // Aplicar filtro de status se fornecido
    if (status) {
      query.status = status;
    }
    
    // Buscar agendamentos do usuário
    const schedules = await CollectionScheduling.find(query)
      .populate('clientId')
      .populate('collectionPointId')
      .populate('addressId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      })
      .sort({ date: -1 });
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos do usuário', error: error.message },
      { status: 500 }
    );
  }
}