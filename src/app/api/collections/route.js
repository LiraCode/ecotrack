import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import Collection from '@/models/collection';
import User from '@/models/user';
import EcoPoint from '@/models/ecopoint';
import connectToDB from '@/lib/db';
import { sendNewCollectionScheduledNotification } from '@/utils/notifications';

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

// Criar nova coleta
export async function POST(request) {
  try {
    await connectToDB();

    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { ecoPointId, scheduledDate, materials } = data;

    // Validar dados obrigatórios
    if (!ecoPointId || !scheduledDate || !materials || materials.length === 0) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Buscar eco ponto e verificar se existe
    const ecoPoint = await EcoPoint.findById(ecoPointId);
    if (!ecoPoint) {
      return NextResponse.json(
        { message: 'Eco ponto não encontrado' },
        { status: 404 }
      );
    }

    // Buscar informações do usuário
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criar nova coleta
    const collection = await Collection.create({
      userId: decodedToken.uid,
      collectorId: ecoPoint.collectorId,
      ecoPointId,
      scheduledDate,
      materials,
      status: 'pending'
    });

    // Enviar notificação para o responsável
    const token = await auth.createCustomToken(decodedToken.uid);
    await sendNewCollectionScheduledNotification({
      collectorId: ecoPoint.collectorId,
      userName: user.name,
      collectionDate: scheduledDate,
      ecoPointName: ecoPoint.name,
      token
    });

    return NextResponse.json(
      { message: 'Coleta agendada com sucesso', collection },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar coleta:', error);
    return NextResponse.json(
      { message: 'Erro ao criar coleta' },
      { status: 500 }
    );
  }
}

// Listar coletas
export async function GET(request) {
  try {
    await connectToDB();

    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query = {};

    // Filtrar por status se fornecido
    if (status) {
      query.status = status;
    }

    // Se não for admin, filtrar por userId ou collectorId
    if (!decodedToken.admin) {
      if (userId) {
        // Verificar se o usuário tem permissão para ver as coletas do userId
        if (decodedToken.uid !== userId) {
          return NextResponse.json(
            { message: 'Não autorizado a ver coletas deste usuário' },
            { status: 403 }
          );
        }
        query.userId = userId;
      } else {
        // Ver próprias coletas ou coletas que é responsável
        query.$or = [
          { userId: decodedToken.uid },
          { collectorId: decodedToken.uid }
        ];
      }
    } else if (userId) {
      // Admin pode filtrar por qualquer userId
      query.userId = userId;
    }

    const collections = await Collection.find(query)
      .sort({ scheduledDate: -1 })
      .populate('ecoPointId', 'name address');

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Erro ao listar coletas:', error);
    return NextResponse.json(
      { message: 'Erro ao listar coletas' },
      { status: 500 }
    );
  }
} 