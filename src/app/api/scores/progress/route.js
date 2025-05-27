import connectToDB from '@/lib/db';
import Score from '@/models/score';
import CollectionScheduling from '@/models/collectionScheduling';
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

// POST - Atualizar progresso de metas a partir de um agendamento
export async function POST(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    const { schedulingId } = data;
    
    if (!schedulingId) {
      return NextResponse.json({ message: 'ID do agendamento é obrigatório' }, { status: 400 });
    }
    
    // Buscar o agendamento
    const scheduling = await CollectionScheduling.findById(schedulingId);
    
    if (!scheduling) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    // Verificar se o agendamento está marcado como coletado
    if (scheduling.status !== 'Coletado') {
      return NextResponse.json({ 
        message: 'Apenas agendamentos coletados podem atualizar metas' 
      }, { status: 400 });
    }
    
    // Obter o ID do usuário e os resíduos coletados
    const userId = scheduling.userId;
    const wastes = scheduling.wastes || [];
    
    if (!userId || wastes.length === 0) {
      return NextResponse.json({ 
        message: 'Agendamento não possui usuário ou resíduos válidos' 
      }, { status: 400 });
    }
    
    // Buscar as metas ativas do usuário
    const userScores = await Score.find({
      clientId: userId,
      status: 'active'
    });
    
    if (userScores.length === 0) {
      return NextResponse.json({ 
        message: 'Usuário não possui metas ativas para atualizar',
        updatedScores: []
      });
    }
    
    // Array para armazenar as metas atualizadas
    const updatedScores = [];
    
    // Para cada resíduo coletado, atualizar as metas correspondentes
    for (const waste of wastes) {
      const wasteId = waste.wasteId;
      const quantity = waste.quantity || 0;
      
      if (!wasteId || quantity <= 0) {
        continue;
      }
      
      // Para cada meta ativa do usuário
      for (const score of userScores) {
        // Atualizar o progresso do resíduo na meta
        const updated = score.updateWasteProgress(wasteId, quantity);
        
        if (updated) {
          // Salvar as alterações
          await score.save();
          
          // Adicionar à lista de metas atualizadas
          if (!updatedScores.includes(score._id)) {
            updatedScores.push(score._id);
          }
        }
      }
    }
    
    return NextResponse.json({ 
      message: 'Progresso das metas atualizado com sucesso',
      updatedScores: updatedScores
    });
  } catch (error) {
    console.error('Error updating scores progress:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar progresso das metas', error: error.message },
      { status: 500 }
    );
  }
}
