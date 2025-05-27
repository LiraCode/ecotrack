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

// POST - Atualizar progresso de um tipo específico de resíduo
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
    const { scoreId, wasteTypeId, quantity } = data;
    
    if (!scoreId || !wasteTypeId || quantity === undefined) {
      return NextResponse.json({ 
        message: 'Dados incompletos. scoreId, wasteTypeId e quantity são obrigatórios' 
      }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(scoreId) || !mongoose.Types.ObjectId.isValid(wasteTypeId)) {
      return NextResponse.json({ message: 'IDs inválidos' }, { status: 400 });
    }
    
    // Verificar se o score existe
    const score = await Score.findById(scoreId);
    if (!score) {
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Atualizar o progresso do tipo de resíduo
    const updated = score.updateWasteProgress(wasteTypeId, quantity);
    
    if (!updated) {
      return NextResponse.json({ 
        message: 'Tipo de resíduo não encontrado nesta meta' 
      }, { status: 400 });
    }
    
    // Salvar as alterações
    await score.save();
    
    return NextResponse.json({
      message: 'Progresso atualizado com sucesso',
      score
    });
  } catch (error) {
    console.error('Error updating waste progress:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar progresso', error: error.message },
      { status: 500 }
    );
  }
}