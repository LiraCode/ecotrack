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

// GET - Obter ranking de usuários
export async function GET(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar usuário atual
    const currentUser = await User.findOne({ firebaseId: decodedToken.uid });
    if (!currentUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Agregar scores por usuário
    const aggregationPipeline = [
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$clientId',
          totalPoints: { $sum: '$earnedPoints' },
          goalsCompleted: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          clientId: '$_id',
          name: { $ifNull: ['$user.name', 'Usuário'] },
          totalPoints: { $ifNull: ['$totalPoints', 0] },
          goalsCompleted: { $ifNull: ['$goalsCompleted', 0] }
        }
      },
      {
        $sort: {
          totalPoints: -1
        }
      }
    ];
    
    const rankingResults = await Score.aggregate(aggregationPipeline);
    
    // Garantir que o usuário atual esteja no ranking
    let currentUserInRanking = rankingResults.some(item => 
      item.clientId && currentUser._id && 
      item.clientId.toString() === currentUser._id.toString()
    );
    
    // Se o usuário atual não estiver no ranking, adicione-o
    if (!currentUserInRanking) {
      rankingResults.push({
        clientId: currentUser._id,
        name: currentUser.name,
        totalPoints: 0,
        goalsCompleted: 0
      });
      
      // Reordenar o ranking
      rankingResults.sort((a, b) => b.totalPoints - a.totalPoints);
    }
    
    // Adicionar posição no ranking
    const rankingWithPosition = rankingResults.map((item, index) => ({
      ...item,
      position: index + 1
    }));
    
    console.log("Ranking gerado:", rankingWithPosition);
    
    return NextResponse.json({ 
      ranking: rankingWithPosition
    });
  } catch (error) {
    console.error('Error generating ranking:', error);
    return NextResponse.json(
      { message: 'Erro ao gerar ranking', error: error.message },
      { status: 500 }
    );
  }
}