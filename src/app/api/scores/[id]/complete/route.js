import connectToDB from '@/lib/db';
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

// PUT - Marcar um score como completo
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = await params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Buscar o score
    const score = await Score.findById(id).populate({
      path: 'goalId',
      populate: {
        path: 'challenges.waste',
        model: 'Waste'
      }
    });
    
    if (!score) {
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Verificar se o score já está completo
    if (score.status === 'completed') {
      return NextResponse.json({ 
        message: 'Este desafio já foi concluído',
        score: score
      });
    }
    
    // Marcar o score como completo
    score.status = 'completed';
    
    // Calcular pontos ganhos com base na meta
    if (score.goalId && score.goalId.points) {
      score.earnedPoints = score.goalId.points;
    }
    
    // Salvar as alterações
    await score.save();
    
    // Buscar o score atualizado e populado
    const updatedScore = await Score.findById(id).populate({
      path: 'goalId',
      populate: {
        path: 'challenges.waste',
        model: 'Waste'
      }
    });
    
    return NextResponse.json({ 
      message: 'Desafio concluído com sucesso',
      score: updatedScore,
      earnedPoints: updatedScore.earnedPoints
    });
  } catch (error) {
    console.error('Error completing score:', error);
    return NextResponse.json(
      { message: 'Erro ao concluir desafio', error: error.message },
      { status: 500 }
    );
  }
}
