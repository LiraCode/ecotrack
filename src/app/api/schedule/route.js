import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import User from '@/models/user';
import CollectionPoint from '@/models/collectionPoint';
import Admin from '@/models/admin';
import Responsable from '@/models/responsable';
import  '@/models/waste';
import  '@/models/address';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import { sendNewCollectionScheduledNotification } from '@/utils/notifications';

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
    let data = user;
    if (!user) {
      const admin = await Admin.findOne({ firebaseId: decodedToken.uid });
      data = admin;
      if (!admin) {
        const responsible = await Responsable.findOne({ firebaseId: decodedToken.uid });
        data = responsible;
        if (!responsible) {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
        }
      }
    }
    
    // Construir filtro de consulta
    const query = {};
    
    // Se for um usuário comum, mostrar apenas seus próprios agendamentos
    if (data.role === 'user') {
      query.userId = data._id;
    } 
    // Se for um responsável por ecoponto, mostrar apenas agendamentos do seu ecoponto
    else if (data.role === 'Responsável') {
      // Buscar ecopontos associados a este responsável
      const ecopoints = await CollectionPoint.find({ responsibleId: data._id });
      const ecopointIds = ecopoints.map(ep => ep._id);
      
      if (ecopointIds.length === 0) {
        return NextResponse.json([]);
      }
      
      query.collectionPointId = { $in: ecopointIds };
    }
    
    // Aplicar filtros adicionais se fornecidos
    if (
      userId &&
      (data.role === "Administrador" || data.role === "Responsável")
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
  console.log('Iniciando criação de agendamento...');
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    console.log('Dados recebidos:', body);
    
    // Validar dados obrigatórios
    if (!body.collectionPointId || !body.date || !body.wastes || !body.addressId) {
      console.error('Dados incompletos:', body);
      return NextResponse.json(
        { message: 'Dados incompletos para o agendamento' },
        { status: 400 }
      );
    }
    
    // Buscar o usuário para obter o ID do MongoDB
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      console.error('Usuário não encontrado:', decodedToken.uid);
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Buscar o ponto de coleta e seu responsável
    const collectionPoint = await CollectionPoint.findById(body.collectionPointId)
      .populate('responsableId');
    
    if (!collectionPoint) {
      console.error('Ponto de coleta não encontrado:', body.collectionPointId);
      return NextResponse.json(
        { message: 'Ponto de coleta não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar o agendamento
    const newSchedule = new CollectionScheduling({
      userId: user._id,
      collectionPointId: body.collectionPointId,
      addressId: body.addressId,
      date: new Date(body.date),
      wastes: body.wastes,
      status: 'Aguardando confirmação do Ponto de Coleta'
    });
    
    await newSchedule.save();
    console.log('Agendamento criado com sucesso:', newSchedule._id);
    
    // Enviar notificação para o responsável
    try {
      const responsible = collectionPoint.responsableId;
      if (responsible && responsible.firebaseId) {
        console.log('Enviando notificação para responsável:', responsible.firebaseId);
        await sendNewCollectionScheduledNotification({
          collectorId: responsible.firebaseId,
          userName: user.name,
          collectionDate: body.date,
          ecoPointName: collectionPoint.name
        });
        console.log('Notificação enviada com sucesso');
      } else {
        console.error('Responsável não encontrado ou sem firebaseId:', responsible);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      // Não retornamos erro aqui para não afetar a criação do agendamento
    }
    
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
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { message: 'Erro ao criar agendamento', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um agendamento existente
export async function PUT(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter ID do agendamento da URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const scheduleId = pathParts[pathParts.length - 1];
    
    if (!scheduleId || scheduleId === 'schedule') {
      return NextResponse.json(
        { message: 'ID do agendamento não fornecido' },
        { status: 400 }
      );
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Buscar o usuário para verificar o papel
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    let data = user;
    if (!user) {
      const admin = await Admin.findOne({ firebaseId: decodedToken.uid });
      data = admin;
      if (!admin) {
        const responsible = await Responsable.findOne({ firebaseId: decodedToken.uid });
        data = responsible;
        if (!responsible) {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
        }
      }
    }
    
    // Buscar o agendamento existente
    const existingSchedule = await CollectionScheduling.findById(scheduleId);
    if (!existingSchedule) {
      return NextResponse.json(
        { message: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar permissões
    // Usuários comuns só podem atualizar seus próprios agendamentos
    if (data.role === 'user' && existingSchedule.userId.toString() !== data._id.toString()) {
      return NextResponse.json(
        { message: 'Não autorizado a modificar este agendamento' },
        { status: 403 }
      );
    }
    
    // Responsáveis só podem atualizar agendamentos de seus ecopontos
    if (data.role === 'Responsável') {
      const ecopoints = await CollectionPoint.find({ responsibleId: data._id });
      const ecopointIds = ecopoints.map(ep => ep._id.toString());
      
      if (!ecopointIds.includes(existingSchedule.collectionPointId.toString())) {
        return NextResponse.json(
          { message: 'Não autorizado a modificar este agendamento' },
          { status: 403 }
        );
      }
    }
    
    // Preparar dados para atualização
    const updateData = {};
    
    // Apenas administradores podem alterar o usuário
    if (data.role === 'Administrador' && body.userId) {
      updateData.userId = body.userId;
    }
    
    // Campos que podem ser atualizados
    if (body.collectionPointId) updateData.collectionPointId = body.collectionPointId;
    if (body.date) updateData.date = new Date(body.date);
    if (body.time !== undefined) updateData.time = body.time;
    if (body.status) updateData.status = body.status;
    if (body.wastes) updateData.wastes = body.wastes;
    if (body.addressId) updateData.addressId = body.addressId;
    if (body.collector !== undefined) updateData.collector = body.collector;
    
    // Atualizar o agendamento
    const updatedSchedule = await CollectionScheduling.findByIdAndUpdate(
      scheduleId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId')
      .populate('collectionPointId')
      .populate('addressId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      });
    
    if (!updatedSchedule) {
      return NextResponse.json(
        { message: 'Erro ao atualizar agendamento' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar agendamento', error: error.message },
      { status: 500 }
    );
  }
}