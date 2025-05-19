import connectToDB from '@/lib/db';
import Score from '@/models/score';
import CollectionScheduling from '@/models/collectionScheduling';
import Goal from '@/models/goal';
import User from '@/models/user';
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
    return user;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  }
}

// POST - Atualizar scores a partir de um agendamento concluído
export async function POST(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validar dados
    if (!data.schedulingId) {
      return NextResponse.json({ message: 'ID do agendamento não fornecido' }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(data.schedulingId)) {
      return NextResponse.json({ message: 'ID de agendamento inválido' }, { status: 400 });
    }
    
    // Buscar agendamento
    const scheduling = await CollectionScheduling.findById(data.schedulingId)
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      });
    
    if (!scheduling) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    // Verificar se o agendamento está concluído
    if (scheduling.status !== 'Concluído') {
      return NextResponse.json({ 
        message: 'Apenas agendamentos concluídos podem atualizar scores' 
      }, { status: 400 });
    }
    
    // Buscar metas ativas do usuário
    const activeScores = await Score.find({
      userId: scheduling.userId,
      status: 'active'
    }).populate('goalId');
    
    if (activeScores.length === 0) {
      return NextResponse.json({ 
        message: 'Usuário não está participando de nenhuma meta ativa' 
      });
    }
    
    // Atualizar cada score com base nos resíduos do agendamento
    const updatedScores = [];
    
    for (const userScore of activeScores) {
      const goal = userScore.goalId;
      let scoreUpdated = false;
      let additionalValue = 0;
      
      // Verificar cada resíduo do agendamento
      for (const scheduledWaste of scheduling.wastes) {
        // Verificar se este tipo de resíduo faz parte dos desafios da meta
        const matchingChallenge = goal.challenges.find(
          challenge => challenge.waste.toString() === scheduledWaste.wasteId._id.toString()
        );
        
        if (matchingChallenge) {
          // Adicionar valor com base no tipo de meta (peso ou quantidade)
          if (goal.targetType === 'weight') {
            additionalValue += scheduledWaste.weight;
          } else {
            additionalValue += scheduledWaste.quantity;
          }
          
          scoreUpdated = true;
        }
      }
      
      if (scoreUpdated) {
        // Atualizar o score do usuário
        const newCurrentValue = userScore.currentValue + additionalValue;
        const targetValue = goal.targetValue;
        
        // Calcular pontos ganhos proporcionalmente
        const additionalPoints = Math.floor((additionalValue / targetValue) * goal.points);
        const newEarnedPoints = userScore.earnedPoints + additionalPoints;
        
        // Verificar se a meta foi concluída
        const newStatus = newCurrentValue >= targetValue ? 'completed' : 'active';
        
        // Atualizar no banco de dados
        const updatedScore = await Score.findByIdAndUpdate(
          userScore._id,
          {
            currentValue: newCurrentValue,
            earnedPoints: newEarnedPoints,
            status: newStatus
          },
          { new: true }
        ).populate('goalId').populate('userId');
        
        updatedScores.push(updatedScore);
      }
    }
    
    return NextResponse.json({ 
      message: 'Scores atualizados com sucesso', 
      updatedScores 
    });
  } catch (error) {
    console.error('Error updating scores from scheduling:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar scores', error: error.message },
      { status: 500 }
    );
  }
}