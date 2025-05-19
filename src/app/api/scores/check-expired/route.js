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

// POST - Verificar e atualizar scores expirados
export async function POST(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar usuário
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    const currentDate = new Date();
    
    // Buscar scores ativos com metas expiradas
    const expiredScores = await Score.find({
      clientId: user._id,
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
    
    return NextResponse.json({
      message: 'Verificação de scores expirados concluída',
      expiredCount: actuallyExpired.length
    });
    
  } catch (error) {
    console.error('Error checking expired scores:', error);
    return NextResponse.json(
      { message: 'Erro ao verificar scores expirados', error: error.message },
      { status: 500 }
    );
  }
}