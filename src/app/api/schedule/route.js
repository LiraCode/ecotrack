import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import User from '@/models/user';
import CollectionPoint from '@/models/collectionPoint';
import  '@/models/waste';
import  '@/models/address';
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

// GET - Buscar agendamentos (com filtros opcionais)
export async function GET(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const collectionPointId = searchParams.get('collectionPointId');
    const status = searchParams.get('status');
    
    // Buscar o usuário para verificar o papel
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Construir filtro de consulta
    const query = {};
    
    // Se for um usuário comum, mostrar apenas seus próprios agendamentos
    if (user.role === 'user') {
      query.userId = user._id;
    } 
    // Se for um responsável por ecoponto, mostrar apenas agendamentos do seu ecoponto
    else if (user.role === 'Responsável') {
      // Buscar ecopontos associados a este responsável
      const ecopoints = await CollectionPoint.find({ responsibleId: user._id });
      const ecopointIds = ecopoints.map(ep => ep._id);
      
      if (ecopointIds.length === 0) {
        return NextResponse.json([]);
      }
      
      query.collectionPointId = { $in: ecopointIds };
    }
    
    // Aplicar filtros adicionais se fornecidos
    if (
      userId &&
      (user.role === "Administrador" || user.role === "Responsável")
    ) {
      query.userId = userId;
    }
    
    if (collectionPointId) {
      query.collectionPointId = collectionPointId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Buscar agendamentos com base nos filtros
    const schedules = await CollectionScheduling.find(query)
      .populate('userId')
      .populate('collectionPointId')
      .populate('addressId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      })
      .sort({ date: -1 });
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar um novo agendamento
export async function POST(request) {
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
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados obrigatórios
    console.log("body", body);
    if (!body.collectionPointId || !body.date || !body.wastes || !body.addressId) {
      return NextResponse.json(
        { message: 'Dados incompletos para o agendamento' },
        { status: 400 }
      );
    }
    
    // Verificar se o ecoponto existe
    const collectionPoint = await CollectionPoint.findById(body.collectionPointId);
    if (!collectionPoint) {
      return NextResponse.json({ message: 'Ecoponto não encontrado' }, { status: 404 });
    }
    
    // Verificar se os tipos de resíduos são aceitos pelo ecoponto
    const wasteIds = body.wastes.map(waste => waste.wasteId);
    const validWastes = collectionPoint.typeOfWasteId.some(id => 
      wasteIds.includes(id.toString())
    );
    
    if (!validWastes) {
      return NextResponse.json(
        { message: 'Um ou mais tipos de resíduos não são aceitos por este ecoponto' },
        { status: 400 }
      );
    }
    
    // Criar o agendamento
    const newSchedule = new CollectionScheduling({
      userId: user._id, // Usar o ID do MongoDB do usuário
      collectionPointId: body.collectionPointId,
      addressId: body.addressId,
      date: new Date(body.date),
      wastes: body.wastes,
      status: 'Aguardando confirmação do Ponto de Coleta',
      collector: 'Pendente'
    });
    
    await newSchedule.save();
    
    // Retornar o agendamento criado com os dados populados
    const populatedSchedule = await CollectionScheduling.findById(newSchedule._id)
      .populate('userId')
      .populate('collectionPointId')
      .populate('addressId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      });
    
    return NextResponse.json(populatedSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { message: 'Erro ao criar agendamento', error: error.message },
      { status: 500 }
    );
  }
}