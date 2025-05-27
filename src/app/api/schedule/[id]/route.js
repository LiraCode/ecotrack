import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import '@/models/waste';
import '@/models/user';
import '@/models/responsable';
import '@/models/address';
import '@/models/collectionPoint';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';
import Score from '@/models/score';

// Função auxiliar para verificar se o ID é válido
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

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

// Função para atualizar os scores do usuário
async function updateUserScores(userId, wastes) {
  try {
    console.log('Iniciando atualização de scores para o usuário:', userId);
    console.log('Resíduos coletados:', JSON.stringify(wastes, null, 2));

    // Buscar scores ativos do usuário
    const activeScores = await Score.find({
      clientId: userId,
      status: 'active'
    }).populate({
      path: 'goalId',
      populate: {
        path: 'challenges.waste',
        model: 'Waste'
      }
    });

    if (!activeScores || activeScores.length === 0) {
      console.log('Nenhum score ativo encontrado para o usuário');
      return { updatedScores: 0, completedGoals: 0 };
    }

    console.log('Scores ativos encontrados:', activeScores.length);

    let updatedCount = 0;
    let completedCount = 0;

    // Para cada score ativo
    for (const score of activeScores) {
      console.log('\nProcessando score:', score._id);
      console.log('Desafios da meta:', JSON.stringify(score.goalId.challenges, null, 2));
      
      let scoreUpdated = false;
      
      // Inicializar progresso se não existir
      if (!score.progress) {
        score.progress = {};
      }

      // Para cada desafio na meta
      for (const challenge of score.goalId.challenges) {
        const challengeId = challenge._id.toString();
        
        // Inicializar progresso do desafio se não existir
        if (!score.progress[challengeId]) {
          score.progress[challengeId] = {
            currentValue: 0,
            targetValue: parseFloat(challenge.value),
            completed: false
          };
        }

        // Para cada resíduo coletado
        for (const waste of wastes) {
          // Verificar se o tipo de resíduo corresponde
          const wasteIdToCompare = typeof waste.wasteId === 'string' ? waste.wasteId : waste.wasteId._id.toString();
          const challengeWasteId = challenge.waste._id.toString();

          console.log('Comparando resíduos:', {
            wasteId: wasteIdToCompare,
            challengeWasteId: challengeWasteId,
            match: wasteIdToCompare === challengeWasteId
          });

          if (wasteIdToCompare === challengeWasteId) {
            const progress = score.progress[challengeId];
            const oldValue = progress.currentValue || 0;
            
            // Atualizar o valor com base no tipo de desafio
            if (challenge.type === 'weight' && waste.weight) {
              progress.currentValue = (progress.currentValue || 0) + parseFloat(waste.weight);
              scoreUpdated = true;
            } else if (challenge.type !== 'weight' && waste.quantity) {
              progress.currentValue = (progress.currentValue || 0) + parseInt(waste.quantity);
              scoreUpdated = true;
            }

            console.log('Atualizando progresso:', {
              challengeId,
              oldValue,
              newValue: progress.currentValue,
              targetValue: progress.targetValue
            });

            // Verificar se o desafio foi completado
            progress.completed = progress.currentValue >= progress.targetValue;
            
            // Atualizar o progresso no score
            score.progress[challengeId] = progress;
          }
        }
      }

      // Se o score foi atualizado
      if (scoreUpdated) {
        updatedCount++;

        // Verificar se todos os desafios foram completados
        const allCompleted = Object.values(score.progress).every(p => p.completed);
        if (allCompleted) {
          score.status = 'completed';
          score.earnedPoints = score.goalId.points;
          completedCount++;
        }

        // Marcar o campo progress como modificado
        score.markModified('progress');
        
        // Salvar as alterações
        await score.save();
        
        console.log('Score atualizado:', {
          scoreId: score._id,
          progress: JSON.stringify(score.progress, null, 2),
          status: score.status,
          earnedPoints: score.earnedPoints
        });
      }
    }

    console.log('Atualização concluída:', {
      updatedScores: updatedCount,
      completedGoals: completedCount
    });

    return { updatedScores: updatedCount, completedGoals: completedCount };
  } catch (error) {
    console.error('Error updating user scores:', error);
    throw error;
  }
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
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar o agendamento atual
    const currentScheduling = await CollectionScheduling.findById(id);
    if (!currentScheduling) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    
    // Atualizar o agendamento
    const updatedScheduling = await CollectionScheduling.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    ).populate('userId').populate('wastes.wasteId');
    
    // Se o status foi alterado para "Coletado", atualizar os scores do usuário
    if (data.status === 'Coletado' && currentScheduling.status !== 'Coletado') {
      try {
        const { updatedScores, completedGoals } = await updateUserScores(
          updatedScheduling.userId._id,
          updatedScheduling.wastes
        );
        
        return NextResponse.json({
          message: 'Agendamento atualizado e metas processadas com sucesso',
          scheduling: updatedScheduling,
          updatedScores,
          completedGoals
        });
      } catch (error) {
        console.error('Erro ao processar metas:', error);
        return NextResponse.json({
          message: 'Agendamento atualizado, mas houve um erro ao processar as metas',
          scheduling: updatedScheduling,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      message: 'Agendamento atualizado com sucesso',
      scheduling: updatedScheduling
    });
  } catch (error) {
    console.error('Error updating scheduling:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar agendamento', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um agendamento específico
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const scheduling = await CollectionScheduling.findByIdAndDelete(id);
    
    if (!scheduling) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting scheduling:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir agendamento', error: error.message },
      { status: 500 }
    );
  }
}
