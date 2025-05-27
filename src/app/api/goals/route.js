import connectToDB from '@/lib/db';
import Goal from '@/models/goal';
import Waste from '@/models/waste';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import Admin from '@/models/admin';
import Responsable from '@/models/responsable';

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

// GET - Buscar metas
export async function GET(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao banco de dados
    await connectToDB();

    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Construir query base
    let query = {};
    if (status) {
      query.status = status;
    }

    // Buscar metas
    const goals = await Goal.find(query)
      .populate('challenges.waste')
      .sort({ createdAt: -1 });

    // Verificar e atualizar status de metas expiradas
    const now = new Date();
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      if (goal.status === 'active' && goal.validUntil && now > new Date(goal.validUntil)) {
        goal.status = 'expired';
        await goal.save();
        console.log(`Meta ${goal._id} atualizada para expirada`);
      }
      return goal;
    }));

    return NextResponse.json({ goals: updatedGoals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar metas', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar nova meta
export async function POST(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao banco de dados
    await connectToDB();

    // Verificar se é admin
    const admin = await Admin.findOne({ firebaseId: decodedToken.uid });
    if (!admin) {
      return NextResponse.json(
        { message: 'Apenas administradores podem criar metas' },
        { status: 403 }
      );
    }

    // Obter dados da requisição
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.title || !data.description || !data.initialDate || !data.validUntil || !data.points) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar nova meta
    const goal = new Goal({
      ...data,
      createdBy: admin._id,
      status: 'active'
    });

    await goal.save();

    return NextResponse.json({ 
      message: 'Meta criada com sucesso',
      goal: goal 
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { message: 'Erro ao criar meta', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar meta existente
export async function PUT(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao banco de dados
    await connectToDB();

    // Verificar se é admin
    const admin = await Admin.findOne({ firebaseId: decodedToken.uid });
    if (!admin) {
      return NextResponse.json(
        { message: 'Apenas administradores podem atualizar metas' },
        { status: 403 }
      );
    }

    // Obter dados da requisição
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { message: 'ID da meta é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar meta
    const goal = await Goal.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!goal) {
      return NextResponse.json(
        { message: 'Meta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Meta atualizada com sucesso',
      goal: goal 
    });
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
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao banco de dados
    await connectToDB();

    // Verificar se é admin
    const admin = await Admin.findOne({ firebaseId: decodedToken.uid });
    if (!admin) {
      return NextResponse.json(
        { message: 'Apenas administradores podem excluir metas' },
        { status: 403 }
      );
    }

    // Obter ID da meta
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID da meta é obrigatório' },
        { status: 400 }
      );
    }

    // Excluir meta
    const goal = await Goal.findByIdAndDelete(id);

    if (!goal) {
      return NextResponse.json(
        { message: 'Meta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Meta excluída com sucesso',
      goal: goal 
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir meta', error: error.message },
      { status: 500 }
    );
  }
}
