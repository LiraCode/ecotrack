import connectToDB from '@/lib/db';
import Score from '@/models/score';
import User from '@/models/user';
import Admin from '@/models/admin';
import Responsable from '@/models/responsable';
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

// GET - Buscar pontos totais do usuário
export async function GET(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar usuário em todas as coleções
    const [regularUser, adminUser, responsibleUser] = await Promise.all([
      User.findOne({ firebaseId: decodedToken.uid }),
      Admin.findOne({ firebaseId: decodedToken.uid }),
      Responsable.findOne({ firebaseId: decodedToken.uid })
    ]);

    // Usar o primeiro usuário encontrado
    const user = regularUser || adminUser || responsibleUser;
    
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    console.log('Buscando pontos para o usuário:', user._id);
    
    // Buscar scores concluídos do usuário
    const scores = await Score.find({
      clientId: user._id,
      status: 'completed'
    });
    
    console.log('Scores concluídos encontrados:', scores.length);
    
    // Calcular pontos totais
    const totalPoints = scores.reduce((sum, score) => {
      console.log('Score:', {
        id: score._id,
        earnedPoints: score.earnedPoints
      });
      return sum + (score.earnedPoints || 0);
    }, 0);
    
    console.log('Total de pontos calculado:', totalPoints);
    
    return NextResponse.json({ points: totalPoints });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar pontos do usuário', error: error.message },
      { status: 500 }
    );
  }
}