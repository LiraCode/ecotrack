import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import Score from '@/models/score';
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

// Função para verificar e atualizar scores expirados de um cliente
async function checkClientExpiredScores(clientId) {
  const currentDate = new Date();
  
  // Buscar scores ativos com metas expiradas
  const expiredScores = await Score.find({
    clientId: clientId,
    status: 'active',
  }).populate('goalId');
  
  // Filtrar scores realmente expirados
  const actuallyExpired = expiredScores.filter(score => {
    const expirationDate = new Date(score.goalId.validUntil);
    return expirationDate < currentDate;
  });
  
  // Atualizar status para expirado
  const updatePromises = actuallyExpired.map(score => {
    score.status = 'expired';
    return score.save();
  });
  
  await Promise.all(updatePromises);
  
  return actuallyExpired.length;
}

// PUT - Marcar agendamento como concluído e atualizar scores
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar o agendamento
    const scheduling = await CollectionScheduling.findById(id)
      .populate('userId')
      .populate({
        path: 'wastes.wasteId',
        model: 'Waste'
      });
    
    if (!scheduling) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    // Verificar se o agendamento já está concluído
    if (scheduling.status === 'Concluído') {
      return NextResponse.json({ message: 'Agendamento já está concluído' }, { status: 400 });
    }
    
    // Atualizar o status do agendamento
    scheduling.status = 'Concluído';
    scheduling.collectedAt = new Date();
    await scheduling.save();
    
    // Verificar e atualizar scores expirados do cliente
    const clientId = scheduling.userId._id;
    const expiredCount = await checkClientExpiredScores(clientId);
    
    // Buscar scores ativos do cliente
    const activeScores = await Score.find({
      clientId: clientId,
      status: 'active'
    }).populate({
      path: 'goalId',
      populate: {
        path: 'challenges.waste',
        model: 'Waste'
      }
    });
    
    // Se não houver scores ativos, apenas retornar sucesso
    if (!activeScores || activeScores.length === 0) {
      return NextResponse.json({ 
        message: 'Agendamento concluído com sucesso, sem metas ativas para atualizar',
        expiredCount
      });
    }
    
    // Para cada score ativo, verificar se os resíduos do agendamento correspondem aos desafios
    const updatedScores = [];
    
    for (const score of activeScores) {
      let scoreUpdated = false;
      let currentValue = score.currentValue || 0;
      
      // Para cada desafio na meta
      for (const challenge of score.goalId.challenges) {
        // Para cada resíduo no agendamento
        for (const waste of scheduling.wastes) {
          // Verificar se o tipo de resíduo corresponde
          if (challenge.waste._id.toString() === waste.wasteId._id.toString()) {
            // Verificar o tipo de meta (peso ou quantidade)
            if (score.goalId.targetType === 'weight' && waste.weight) {
              // Incrementar o peso
              currentValue += waste.weight;
              scoreUpdated = true;
            } else if (score.goalId.targetType === 'quantity' && waste.quantity) {
              // Incrementar a quantidade
              currentValue += waste.quantity;
              scoreUpdated = true;
            }
          }
        }
      }
      
      // Se o score foi atualizado, salvar as alterações
      if (scoreUpdated) {
        score.currentValue = currentValue;
        
        // Verificar se a meta foi concluída
        if (currentValue >= score.goalId.targetValue) {
          score.status = 'completed';
          score.earnedPoints = score.goalId.points;
        }
        
        await score.save();
        updatedScores.push(score);
      }
    }
    
    return NextResponse.json({ 
      message: 'Agendamento concluído e metas atualizadas com sucesso',
      updatedScores: updatedScores.length,
      expiredCount
    });
    
  } catch (error) {
    console.error('Error completing scheduling:', error);
    return NextResponse.json(
      { message: 'Erro ao concluir agendamento', error: error.message },
      { status: 500 }
    );
  }
}
