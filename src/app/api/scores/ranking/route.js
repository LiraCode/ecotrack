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

// GET - Buscar ranking de usuários
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
    const currentUser = regularUser || adminUser || responsibleUser;
    
    if (!currentUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    console.log('Buscando ranking para o usuário:', currentUser._id);
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const goalId = searchParams.get('goalId');
    
    // Construir pipeline de agregação
    const pipeline = [];
    
    // Filtrar por meta específica se fornecido
    if (goalId) {
      pipeline.push({ $match: { goalId: goalId, status: 'completed' } });
    } else {
      pipeline.push({ $match: { status: 'completed' } });
    }
    
    // Agrupar por usuário e somar pontos
    pipeline.push({
      $group: {
        _id: '$clientId',
        totalPoints: { $sum: '$earnedPoints' },
        completedChallenges: { $sum: 1 }
      }
    });
    
    // Ordenar por pontos (decrescente)
    pipeline.push({ $sort: { totalPoints: -1 } });
    
    // Limitar resultados
    pipeline.push({ $limit: limit });
    
    console.log('Pipeline de agregação:', JSON.stringify(pipeline, null, 2));
    
    // Executar agregação
    const rankingData = await Score.aggregate(pipeline);
    
    console.log('Dados do ranking após agregação:', rankingData);
    
    // Buscar informações dos usuários em todas as coleções
    const userIds = rankingData.map(item => item._id);
    const [users, admins, responsibles] = await Promise.all([
      User.find({ _id: { $in: userIds } }, 'name'),
      Admin.find({ _id: { $in: userIds } }, 'name'),
      Responsable.find({ _id: { $in: userIds } }, 'name')
    ]);
    
    console.log('Usuários encontrados:', {
      users: users.length,
      admins: admins.length,
      responsibles: responsibles.length
    });
    
    // Mapear IDs para nomes de usuários
    const userMap = {};
    [...users, ...admins, ...responsibles].forEach(user => {
      userMap[user._id.toString()] = user.name;
    });
    
    // Formatar resultado final
    const ranking = rankingData.map((item, index) => ({
      clientId: item._id,
      name: userMap[item._id.toString()] || 'Usuário',
      totalPoints: item.totalPoints,
      completedChallenges: item.completedChallenges,
      position: index + 1,
      isCurrentUser: item._id.toString() === currentUser._id.toString()
    }));
    
    console.log('Ranking formatado:', ranking);
    
    // Encontrar posição do usuário atual
    const currentUserPosition = ranking.findIndex(item => item.isCurrentUser) + 1;
    
    return NextResponse.json({ 
      ranking,
      currentUserPosition: currentUserPosition > 0 ? currentUserPosition : null,
      totalParticipants: ranking.length
    });
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar ranking', error: error.message },
      { status: 500 }
    );
  }
}