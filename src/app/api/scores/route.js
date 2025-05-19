import connectToDB from '@/lib/db';
import Score from '@/models/score';
import Goal from '@/models/goal';
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

// GET - Buscar scores do usuário
export async function GET(request) {
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
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Construir filtro de consulta
    const query = { clientId: user._id };
    
    // Aplicar filtro de status se fornecido
    if (status) {
      query.status = status;
    }
    
    // Buscar scores do usuário
    const scores = await Score.find(query)
      .populate('goalId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching user scores:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar scores do usuário', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo score (participar de uma meta)
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
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    const { goalId } = data;
    
    // Verificar se a meta existe
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return NextResponse.json({ message: 'Meta não encontrada' }, { status: 404 });
    }
    
    // Verificar se o usuário já participa desta meta
    const existingScore = await Score.findOne({
      clientId: user._id,
      goalId: goalId
    });
    
    if (existingScore) {
      return NextResponse.json({ message: 'Você já está participando desta meta' }, { status: 400 });
    }
    
    // Criar novo score
    const newScore = new Score({
      clientId: user._id,
      goalId: goalId,
      status: 'active',
      currentValue: 0,
      earnedPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newScore.save();
    
    return NextResponse.json({ 
      message: 'Participação na meta registrada com sucesso',
      score: newScore
    });
  } catch (error) {
    console.error('Error creating score:', error);
    return NextResponse.json(
      { message: 'Erro ao participar da meta', error: error.message },
      { status: 500 }
    );
  }
}