import connectToDB from '@/lib/db';
import Score from '@/models/score';
import User from '@/models/user';
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

// GET - Buscar scores de um usuário específico
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Buscar scores do usuário
    const scores = await Score.find({ clientId: id })
      .populate({
        path: 'goalId',
        populate: {
          path: 'challenges.waste',
          model: 'Waste'
        }
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching user scores:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar scores do usuário', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Atualizar progresso de todos os scores de um usuário
export async function POST(request, { params }) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    const { wastes } = data;
    
    if (!wastes || !Array.isArray(wastes) || wastes.length === 0) {
      return NextResponse.json({ 
        message: 'Dados de resíduos não fornecidos ou inválidos' 
      }, { status: 400 });
    }
    
    // Buscar scores ativos do usuário
    const activeScores = await Score.find({ 
      clientId: id,
      status: 'active'
    }).populate({
      path: 'goalId',
      populate: {
        path: 'challenges.waste',
        model: 'Waste'
      }
    });
    
    if (activeScores.length === 0) {
      return NextResponse.json({ 
        message: 'Usuário não possui metas ativas' 
      }, { status: 404 });
    }
    
    const updatedScores = [];
    let completedGoals = 0;
    
    // Para cada score ativo
    for (const score of activeScores) {
      let scoreUpdated = false;
      
      // Verificar se a meta tem desafios
      const goalChallenges = score.goalId?.challenges || [];
      if (goalChallenges.length === 0) continue;
      
      // Para cada resíduo coletado
      for (const waste of wastes) {
        const wasteId = typeof waste.wasteId === 'object' ? waste.wasteId._id : waste.wasteId;
        
        // Encontrar desafios correspondentes a este tipo de resíduo
        const matchingChallenges = goalChallenges.filter(challenge => 
          challenge.waste._id.toString() === wasteId.toString()
        );
        
        if (matchingChallenges.length === 0) continue;
        
        for (const challenge of matchingChallenges) {
          // Determinar o valor a ser adicionado com base no tipo de desafio
          const valueToAdd = challenge.type === 'weight' ? 
            (waste.weight || 0) : 
            (waste.quantity || 0);
          
          if (valueToAdd <= 0) continue;
          
          // Inicializar o objeto de progresso se necessário
          if (!score.progress) score.progress = {};
          
          const challengeId = challenge._id.toString();
          
          // Inicializar o progresso para este desafio se não existir
          if (!score.progress[challengeId]) {
            score.progress[challengeId] = {
              currentValue: 0,
              targetValue: parseFloat(challenge.value),
              completed: false
            };
          }
          
          // Atualizar o valor atual
          score.progress[challengeId].currentValue += parseFloat(valueToAdd);
          
          // Verificar se o desafio foi concluído
          if (score.progress[challengeId].currentValue >= score.progress[challengeId].targetValue) {
            score.progress[challengeId].completed = true;
          }
          
          scoreUpdated = true;
        }
      }
      
      // Se o score foi atualizado, verificar se todos os desafios foram concluídos
      if (scoreUpdated) {
        // Verificar se todos os desafios foram concluídos
        const allChallengesCompleted = Object.values(score.progress || {}).every(p => p.completed);
        
        if (allChallengesCompleted) {
          score.status = 'completed';
          score.earnedPoints = score.goalId.points;
          completedGoals++;
        }
        
        // Salvar as alterações
        await score.save();
        updatedScores.push(score);
      }
    }
    
    return NextResponse.json({ 
      message: `Progresso atualizado com sucesso. ${completedGoals} meta(s) completada(s).`,
      updatedScores: updatedScores,
      completedGoals: completedGoals
    });
  } catch (error) {
    console.error('Error updating user scores:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar progresso das metas', error: error.message },
      { status: 500 }
    );
  }
}
