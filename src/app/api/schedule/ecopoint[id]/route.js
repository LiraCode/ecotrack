import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import User from '@/models/user';
import CollectionPoint from '@/models/collectionPoint';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

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

// Função auxiliar para verificar se o ID é válido
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Buscar agendamentos de um ecoponto específico
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar o usuário para verificar permissões
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o ecoponto existe
    const ecopoint = await CollectionPoint.findById(id);
    if (!ecopoint) {
      return NextResponse.json({ message: 'Ecoponto não encontrado' }, { status: 404 });
    }
    
    // Verificar permissões
    const isResponsible = user.role === 'responsible' && 
      ecopoint.responsibleId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    
    if (!isResponsible && !isAdmin) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    // Construir filtro de consulta
    const query = { collectionPointId: id };
    
    // Aplicar filtros adicionais se fornecidos
    if (status) {
      query.status = status;
    }
    
    if (date) {
      // Filtrar por data (início do dia até o fim do dia)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Buscar agendamentos do ecoponto
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
    console.error('Error fetching ecopoint schedules:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos do ecoponto', error: error.message },
      { status: 500 }
    );
  }
}