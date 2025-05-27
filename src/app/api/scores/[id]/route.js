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

// PUT - Atualizar progresso de um score específico
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
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    const { currentValue } = data;
    
    // Verificar se o score existe
    const score = await Score.findById(id);
    if (!score) {
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Atualizar o valor atual
    if (currentValue !== undefined) {
      score.currentValue = currentValue;
    }
    
    // Salvar as alterações
    await score.save();
    
    return NextResponse.json({
      message: 'Score atualizado com sucesso',
      score
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar score', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover um score específico
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
    
    // Verificar se o score existe
    const score = await Score.findById(id);
    if (!score) {
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Remover o score
    await Score.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Score removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting score:', error);
    return NextResponse.json(
      { message: 'Erro ao remover score', error: error.message },
      { status: 500 }
    );
  }
}
