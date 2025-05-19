import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

// Função auxiliar para verificar se o ID é válido
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Buscar um agendamento específico pelo ID
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
    
    // Buscar o agendamento
    const schedule = await CollectionScheduling.findById(id)
      .populate('userId')
      .populate('collectionPointId')
      .populate('addressId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      });
    
    if (!schedule) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar agendamento', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um agendamento específico
export async function PUT(request, { params }) {
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
    
    // Buscar o agendamento existente
    const existingSchedule = await CollectionScheduling.findById(id);
    console.log('Existing Schedule:', existingSchedule);
    if (!existingSchedule) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const updateData = await request.json();
    
    // Campos permitidos para atualização
    const allowedFields = [
      'status', 
      'collector', 
      'collectedAt', 
      'wastes'
    ];
    
    // Filtrar apenas os campos permitidos
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    // Validar status
    const validStatus = [
      'Aguardando confirmação do Ponto de Coleta',
      'Confirmado',
      'Coletado',
      'Cancelado'
    ];
    
    if (filteredData.status && !validStatus.includes(filteredData.status)) {
      return NextResponse.json({ message: 'Status inválido' }, { status: 400 });
    }
    
    // Se o status for alterado para "Coletado" e não houver data de coleta, definir para a data atual
    if (filteredData.status === 'Coletado' && !filteredData.collectedAt) {
      filteredData.collectedAt = new Date();
    }
    
    // Validar wastes se fornecido
    if (filteredData.wastes) {
      // Verificar se é um array
      if (!Array.isArray(filteredData.wastes)) {
        return NextResponse.json({ message: 'O campo wastes deve ser um array' }, { status: 400 });
      }
      
      // Verificar cada item do array
      for (const waste of filteredData.wastes) {
        if (!waste.wasteId || !mongoose.Types.ObjectId.isValid(waste.wasteId)) {
          return NextResponse.json({ message: 'ID de resíduo inválido' }, { status: 400 });
        }
        
        if (typeof waste.quantity !== 'number' || waste.quantity < 0) {
          return NextResponse.json({ message: 'Quantidade de resíduo inválida' }, { status: 400 });
        }
        
        if (typeof waste.weight !== 'number' || waste.weight < 0) {
          return NextResponse.json({ message: 'Peso de resíduo inválido' }, { status: 400 });
        }
      }
    }
    
    // Atualizar o agendamento
    const updatedSchedule = await CollectionScheduling.findByIdAndUpdate(
      id,
      filteredData,
      { new: true }
    )
    .populate('userId')
    .populate('collectionPointId')
    .populate('addressId')
    .populate({
      path: 'wastes.wasteId',
      model: 'Waste'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar agendamento', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um agendamento específico
export async function DELETE(request, { params }) {
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
    
    // Buscar o agendamento
    const schedule = await CollectionScheduling.findById(id);
    if (!schedule) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    // Excluir o agendamento
    await CollectionScheduling.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Agendamento excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir agendamento', error: error.message },
      { status: 500 }
    );
  }
}
