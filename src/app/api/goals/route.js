import connectToDB from '@/lib/db';
import Goal from '@/models/goal';
import User from '@/models/user';
import Admin from '@/models/admin';
import  '@/models/waste';
import { auth } from '@/config/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Verificar autenticação
async function verifyAuth(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      const Admins = await Admin.findOne({ firebaseId: decodedToken.uid });
      return Admins;
    }
    return user;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  }
}

// GET - Buscar metas
export async function GET(request) {
  try {
    await connectToDB();
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    
    // Construir filtro de consulta
    const query = {};
    
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
      }
      query._id = id;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Buscar metas
    const goals = await Goal.find(query)
      .populate({
        path: 'challenges.waste',
        model: 'Waste'
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar metas', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar meta
export async function POST(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação
    const user = await verifyAuth(request);
    if (!user) {
      console.error('Error user:');
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se é admin
    if (user.role !== 'Administrador') {
      console.error("Erro administrador:");
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    
    // Validar dados
    if (!data.title || !data.description || !data.initialDate || !data.validUntil || 
        !data.points || !data.targetType || !data.targetValue || !data.challenges || 
        data.challenges.length === 0) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }
    
    // Criar nova meta
    const goal = new Goal({
      title: data.title,
      description: data.description,
      initialDate: new Date(data.initialDate),
      validUntil: new Date(data.validUntil),
      status: 'active',
      points: data.points,
      targetType: data.targetType,
      targetValue: data.targetValue,
      challenges: data.challenges.map(challenge => ({
        waste: challenge.waste,
        weight: data.targetType === 'weight' ? challenge.weight : 0,
        quantity: data.targetType === 'quantity' ? challenge.quantity : 0
      }))
    });
    
    await goal.save();
    
    // Retornar meta criada
    const savedGoal = await Goal.findById(goal._id).populate({
      path: 'challenges.waste',
      model: 'Waste'
    });
    
    return NextResponse.json({ message: 'Meta criada com sucesso', goal: savedGoal });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { message: 'Erro ao criar meta', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar meta
export async function PUT(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação
    const user = await verifyAuth(request);
    if (!user) {
      console.error('Error user:');
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se é admin
    if (user.role !== 'Administrador') {
      console.error("Erro administrador:");
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    
    // Validar ID
    if (!data.id || !mongoose.Types.ObjectId.isValid(data.id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar se a meta existe
    const existingGoal = await Goal.findById(data.id);
    if (!existingGoal) {
      return NextResponse.json({ message: 'Meta não encontrada' }, { status: 404 });
    }
    
    // Atualizar meta
    const updatedGoal = await Goal.findByIdAndUpdate(
      data.id,
      {
        title: data.title,
        description: data.description,
        initialDate: new Date(data.initialDate),
        validUntil: new Date(data.validUntil),
        status: data.status || existingGoal.status,
        points: data.points,
        targetType: data.targetType,
        targetValue: data.targetValue,
        challenges: data.challenges.map(challenge => ({
          waste: challenge.waste,
          weight: data.targetType === 'weight' ? challenge.weight : 0,
          quantity: data.targetType === 'quantity' ? challenge.quantity : 0
        }))
      },
      { new: true }
    ).populate({
      path: 'challenges.waste',
      model: 'Waste'
    });
    
    return NextResponse.json({ message: 'Meta atualizada com sucesso', goal: updatedGoal });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar meta', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir meta
export async function DELETE(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se é admin
    if (user.role !== "Administrador") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validar ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar se a meta existe
    const existingGoal = await Goal.findById(id);
    if (!existingGoal) {
      return NextResponse.json({ message: 'Meta não encontrada' }, { status: 404 });
    }
    
    // Excluir meta
    await Goal.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Meta excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir meta', error: error.message },
      { status: 500 }
    );
  }
}