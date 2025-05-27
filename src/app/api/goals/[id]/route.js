import connectToDB from '@/lib/db';
import Goal from '@/models/goal';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';
import Score from '@/models/score';

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

// GET - Buscar uma meta específica pelo ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    const goal = await Goal.findById(id).populate('challenges.waste');
    
    if (!goal) {
      return NextResponse.json({ message: 'Meta não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar meta', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma meta existente
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se a meta existe
    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json({ message: 'Meta não encontrada' }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.title || !data.description || !data.initialDate || !data.validUntil || !data.points) {
      return NextResponse.json({ 
        message: 'Dados incompletos. Título, descrição, datas e pontos são obrigatórios' 
      }, { status: 400 });
    }
    
    // Validar desafios
    if (!data.challenges || !Array.isArray(data.challenges) || data.challenges.length === 0) {
      return NextResponse.json({ 
        message: 'A meta deve ter pelo menos um desafio' 
      }, { status: 400 });
    }
    
    // Atualizar a meta
    const updatedGoal = await Goal.findByIdAndUpdate(
      id,
      {
        title: data.title,
        description: data.description,
        initialDate: new Date(data.initialDate),
        validUntil: new Date(data.validUntil),
        status: data.status,
        points: data.points,
        challenges: data.challenges,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    // Atualizar os scores relacionados a esta meta
    const scores = await Score.find({ goalId: id, status: 'active' });
    
    for (const score of scores) {
      // Preparar o objeto de progresso para cada desafio da meta atualizada
      const progress = {};
      
      for (const challenge of updatedGoal.challenges) {
        const challengeId = challenge._id.toString();
        const oldProgress = score.progress[challengeId];
        
        // Se já existe progresso para este desafio, manter o valor atual
        if (oldProgress) {
          progress[challengeId] = {
            currentValue: oldProgress.currentValue,
            targetValue: parseFloat(challenge.value),
            completed: oldProgress.currentValue >= parseFloat(challenge.value)
          };
        } else {
          // Se é um novo desafio, inicializar com valor zero
          progress[challengeId] = {
            currentValue: 0,
            targetValue: parseFloat(challenge.value),
            completed: false
          };
        }
      }
      
      // Atualizar o score com o novo progresso
      score.progress = progress;
      await score.save();
    }
    
    return NextResponse.json({ 
      message: 'Meta e scores atualizados com sucesso',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar meta', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma meta
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se a meta existe
    const goal = await Goal.findById(id);
    if (!goal) {
      return NextResponse.json({ message: 'Meta não encontrada' }, { status: 404 });
    }
    
    // Excluir a meta
    await Goal.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Meta excluída com sucesso'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir meta', error: error.message },
      { status: 500 }
    );
  }
}
