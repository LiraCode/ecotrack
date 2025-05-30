import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Score from '@/models/score';
import User from '@/models/user';
import Admin from '@/models/admin';
import Responsable from '@/models/responsable';
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
    
    // Verificar se é admin ou responsável
    const [admin, responsable] = await Promise.all([
      Admin.findOne({ firebaseId: decodedToken.uid }),
      Responsable.findOne({ firebaseId: decodedToken.uid })
    ]);

    // Se for admin ou responsável, retorna 0 pontos
    if (admin || responsable) {
      return NextResponse.json({ points: 0 });
    }

    // Buscar usuário comum
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      console.log('Usuário não encontrado para firebaseId:', decodedToken.uid);
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Buscar scores concluídos do usuário
    const scores = await Score.find({
      clientId: user._id,
      status: 'completed'
    });
    
    // Calcular pontos totais
    const totalPoints = scores.reduce((sum, score) => {
      return sum + (typeof score.earnedPoints === 'number' ? score.earnedPoints : 0);
    }, 0);
    
    //console.log("totalpoints: ", totalPoints)
    return NextResponse.json({ points: totalPoints });
  } catch (error) {
    console.log("erro points");
    console.error('Error fetching user points:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar pontos do usuário', error: error.message },
      { status: 500 }
    );
  }
}