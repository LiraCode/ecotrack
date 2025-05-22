import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Responsable from '@/models/responsable';
import { auth } from '@/config/firebase/firebaseAdmin';

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

export async function POST(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao MongoDB
    await connectDB();
    
    // Obter dados da requisição
    const responsibleData = await request.json();
    console.log("Dados recebidos:", JSON.stringify(responsibleData));

    // Validar dados básicos
    if (!responsibleData.email || !responsibleData.password || !responsibleData.name || !responsibleData.cpf) {
      console.error("Dados obrigatórios ausentes");
      return NextResponse.json(
        { error: 'Nome, email, CPF e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe no Firebase
    try {
      const userRecord = await auth.getUserByEmail(responsibleData.email);
      if (userRecord) {
        return NextResponse.json(
          { error: 'Email já cadastrado no Firebase' },
          { status: 409 }
        );
      }
    } catch (error) {
      // Se o erro for auth/user-not-found, significa que o email não existe
      if (error.code !== 'auth/user-not-found') {
        console.error("Erro ao verificar email no Firebase:", error);
        return NextResponse.json(
          { error: 'Erro ao verificar email', details: error.message },
          { status: 500 }
        );
      }
    }

    // Criar usuário no Firebase
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: responsibleData.email,
        password: responsibleData.password,
        displayName: responsibleData.name,
        disabled: false
      });
      
      // Definir claims personalizadas para o usuário
      await auth.setCustomUserClaims(userRecord.uid, {
        role: 'Responsável'
      });
      
      console.log("Usuário criado no Firebase:", userRecord.uid);
    } catch (firebaseError) {
      console.error("Erro ao criar usuário no Firebase:", firebaseError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário no Firebase', details: firebaseError.message },
        { status: 500 }
      );
    }

    // Criar responsável no MongoDB
    try {
      const newResponsible = new Responsable({
        firebaseId: userRecord.uid,
        name: responsibleData.name,
        email: responsibleData.email,
        phone: responsibleData.phone || '',
        cpf: responsibleData.cpf,
        role: 'Responsável'
      });

      await newResponsible.save();
      console.log("Responsável salvo com sucesso:", newResponsible._id);

      return NextResponse.json(
        { success: true, responsible: newResponsible },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Erro ao salvar responsável:", saveError);

      // Se houver erro ao salvar no MongoDB, excluir o usuário do Firebase
      try {
        await auth.deleteUser(userRecord.uid);
        console.log("Usuário excluído do Firebase após falha no MongoDB");
      } catch (deleteError) {
        console.error("Erro ao excluir usuário do Firebase:", deleteError);
      }

      // Verificar se é um erro de duplicação
      if (saveError.code === 11000) {
        return NextResponse.json(
          { error: 'Email ou CPF já cadastrado' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao criar responsável', details: saveError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro não tratado:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao MongoDB
    await connectDB();
    
    // Obter query params
    const url = new URL(request.url);
    const uid = url.searchParams.get('uid');
    const email = url.searchParams.get('email');

    if (uid) {
      // Buscar responsável pelo UID do Firebase
      const responsible = await Responsable.findOne({ firebaseId: uid });

      if (!responsible) {
        return NextResponse.json(
          { error: 'Responsável não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, responsible },
        { status: 200 }
      );
    } else if (email) {
      // Buscar responsável pelo email
      const responsible = await Responsable.findOne({ email });

      if (!responsible) {
        return NextResponse.json(
          { error: 'Responsável não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, responsible },
        { status: 200 }
      );
    } else {
      // Buscar todos os responsáveis
      const responsibles = await Responsable.find();

      return NextResponse.json(
        { success: true, responsibles },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Erro ao buscar responsável(eis):', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar responsável(eis)', details: error.message },
      { status: 500 }
    );
  }
}
