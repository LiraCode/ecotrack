import connectToDB from '@/lib/db';
import Score from '@/models/score';
import Goal from '@/models/goal';
import User from '@/models/user';
import Admin from '@/models/admin';
import Responsable from '@/models/responsable';
import '@/models/goal';
import '@/models/waste';
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
    const AdminUser = await Admin.findOne({ firebaseId: decodedToken.uid });
    const responsible = await Responsable.findOne({ firebaseId: decodedToken.uid });
    
    if (!user && !AdminUser && !responsible) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    
    // Construir filtro de consulta
    let query = {};
    
    // Se não for fornecido um userId específico, usar o ID do usuário autenticado
    if (userId) {
      query.clientId = userId;

    } else if (user) {
      query.clientId = user._id;
    }
    
    // Aplicar filtro de status se fornecido
    if (status) {
      query.status = status;
    }
    
    // Buscar scores do usuário
    const scores = await Score.find(query)
      .populate({
        path: 'goalId',
        populate: {
          path: 'challenges.waste',
          model: 'Waste'
        }
      })
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

// POST - Participar de uma meta
export async function POST(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao banco de dados
    await connectToDB();

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

    // Se for admin ou responsável, não pode participar
    if (adminUser || responsibleUser) {
      return NextResponse.json(
        { message: 'Administradores e responsáveis não podem participar de metas' },
        { status: 403 }
      );
    }

    // Obter dados da requisição
    const data = await request.json();
    const { goalId } = data;

    if (!goalId) {
      return NextResponse.json(
        { message: 'ID da meta é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar a meta
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return NextResponse.json(
        { message: 'Meta não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a meta está expirada
    if (goal.validUntil && new Date() > new Date(goal.validUntil)) {
      return NextResponse.json(
        { message: 'Esta meta já expirou e não aceita mais participantes' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já está participando desta meta
    const existingScore = await Score.findOne({
      clientId: user._id,
      goalId: goalId
    });

    if (existingScore) {
      return NextResponse.json(
        { message: 'Você já está participando desta meta' },
        { status: 400 }
      );
    }

    // Criar novo score
    const score = new Score({
      clientId: user._id,
      goalId: goalId,
      status: 'active',
      progress: {},
      earnedPoints: 0
    });

    // Inicializar progresso para cada desafio
    goal.challenges.forEach(challenge => {
      score.progress[challenge._id.toString()] = {
        currentValue: 0,
        targetValue: parseFloat(challenge.value),
        completed: false
      };
    });

    await score.save();

    // Retornar score criado
    return NextResponse.json({ 
      message: 'Participação registrada com sucesso',
      score: score 
    });

  } catch (error) {
    console.error('Error creating score:', error);
    return NextResponse.json(
      { message: 'Erro ao registrar participação', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um score existente
export async function PUT(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar nas collections  user, Responsable e admin
    const AdminUser = await Admin.findOne({ firebaseId: decodedToken.uid });
    const ResponsibleUser = await Responsable.findOne({ firebaseId: decodedToken.uid });
    const user = await User.findOne({ firebaseId: decodedToken.uid });

    if (!AdminUser && !ResponsibleUser && !user) {
      return NextResponse.json({ message: 'Usuário não encontrado/autorizado' }, { status: 401 });
    }
   
    
    // Obter dados do corpo da requisição
    const data = await request.json();
    const { id, wasteTypeId, quantity, status } = data;
    
    if (!id) {
      return NextResponse.json({ message: 'ID do score é obrigatório' }, { status: 400 });
    }
    
    // Verificar se o score existe
    const score = await Score.findById(id);
    if (!score) {
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Verificar se o usuário é o dono do score ou um administrador
    if (score.clientId.toString() !== user._id.toString() && ResponsibleUser?.role !== 'Responsável' && AdminUser?.role !== 'Admininistrador') {
      return NextResponse.json({ message: 'Não autorizado a modificar este score' }, { status: 403 });
    }
    
    // Atualizar o progresso de um tipo específico de resíduo
    if (wasteTypeId && quantity) {
      const updated = score.updateWasteProgress(wasteTypeId, quantity);
      
      if (!updated) {
        return NextResponse.json({ 
          message: 'Tipo de resíduo não encontrado nesta meta' 
        }, { status: 400 });
      }
    } 
    // Atualizar o status diretamente
    else if (status) {
      score.status = status;
    }
    
    // Salvar o score (os middlewares pré-save serão executados)
    await score.save();
    
    return NextResponse.json({ 
      message: 'Score atualizado com sucesso',
      score: score
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar score', error: error.message },
      { status: 500 }
    );
  }
}