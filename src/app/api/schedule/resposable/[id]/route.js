import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import User from '@/models/user';
import Responsable from '@/models/responsable';
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

// GET - Buscar agendamentos de um responsável específico
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação do usuário
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }
    
    // Buscar o responsável para verificar permissões
    const responsable = await Responsable.findById(id);
    if (!responsable) {
        console.log("Responsável não encontrado");
      return NextResponse.json({ message: 'Responsável não encontrado' }, { status: 404 });
    }
    
    // Verificar se o usuário autenticado é o responsável ou um administrador
    const authenticatedUser = await Responsable.findOne({ firebaseId: decodedToken.uid });
    if (!authenticatedUser) {
        console.log("Responsável não encontrado");
      return NextResponse.json({ message: 'Responsável não encontrado' }, { status: 404 });
    }
    
    const isRequestingOwnData = authenticatedUser._id.toString() === id;
    const isAdmin = authenticatedUser.role === 'Administrador';
    
    if (!isRequestingOwnData && !isAdmin) {
      return NextResponse.json({ message: 'Não autorizado a acessar agendamentos deste responsável' }, { status: 403 });
    }
    
    // Buscar todos os ecopontos associados a este responsável
    const ecopoints = await CollectionPoint.find({ responsableId: id });
    
    if (ecopoints.length === 0) {
      return NextResponse.json({ message: 'Nenhum ecoponto encontrado para este responsável' }, { status: 404 });
    }
    
    const ecopointIds = ecopoints.map(ecopoint => ecopoint._id);
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Construir filtro de consulta
    const query = { collectionPointId: { $in: ecopointIds } };
    
    // Aplicar filtros adicionais se fornecidos
    if (status) {
      query.status = status;
    }
    
    if (date) {
      // Filtrar por data específica (início do dia até o fim do dia)
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      query.date = { $gte: dateStart, $lte: dateEnd };
    } else if (startDate && endDate) {
      // Filtrar por intervalo de datas
      const dateStart = new Date(startDate);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(endDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      query.date = { $gte: dateStart, $lte: dateEnd };
    }
    
    // Buscar agendamentos dos ecopontos
    const schedules = await CollectionScheduling.find(query)
      .populate('userId')
      .populate('collectionPointId')
      .populate('addressId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      })
      .sort({ date: -1 });
    
    return NextResponse.json({
      success: true,
      count: schedules.length,
      schedules: schedules
    });
  } catch (error) {
    console.error('Error fetching responsible schedules:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos do responsável', error: error.message },
      { status: 500 }
    );
  }
}