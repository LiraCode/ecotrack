import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/admin';
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
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    // Verificar token do Firebase
    const decodedToken = await auth.verifyIdToken(token);
    console.log("Token decodificado:", decodedToken);
    const uid = decodedToken.uid;
    console.log("UID do usuário:", uid);


    
    // Verificar se o usuário é admin no MongoDB
    await connectDB();
    const admin = await Admin.findOne({ firebaseId: uid });
    console.log("Usuário encontrado:", admin);
    
    if (!admin) {
      return NextResponse.json({ error: "Usuário não encontrado como administrador" }, { status: 403 });
    }
    
    if (admin.role !== 'Administrador') {
      return NextResponse.json({ error: "Usuário não tem permissões de administrador" }, { status: 403 });
    }

    console.log("Token decodificado:", uid);   console.log("Iniciando processamento da requisição POST /api/admin");

    // Conectar ao MongoDB
    await connectDB();
    console.log("Conexão com MongoDB estabelecida");

    // Obter dados da requisição
    const adminData = await request.json();
  
    console.log("Dados recebidos:", adminData.data);
    // Validar dados básicos
    if (!adminData.data.email || !adminData.data.name || !adminData.data.role || !adminData.data.password) {
      console.error("Dados obrigatórios ausentes", adminData);
      return NextResponse.json(
        { error: 'Nome, email, senha e função são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar usuário no Firebase usando o Admin SDK
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: adminData.data.email,
        password: adminData.data.password,
        displayName: adminData.data.name,
        disabled: false
      });
      console.log("Usuário criado no Firebase:", adminData);
      
      console.log("Usuário criado no Firebase:", userRecord.uid);
      
      // Definir claims personalizadas para o usuário (opcional)
      await auth.setCustomUserClaims(userRecord.uid, {
        role: adminData.data.role,
      });
    } catch (firebaseError) {
      console.error("Erro ao criar usuário no Firebase:", firebaseError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário no Firebase', details: firebaseError.message },
        { status: 500 }
      );
    }
    console.log("name:", adminData.data.name);
    console.log("email:", adminData.data.email);
    console.log("phone:", adminData.data.phone);
    console.log("role:", adminData.data.role);
    // Criar novo Administrador no MongoDB
    try {
      console.log("Tentando criar Administrador no MongoDB");
      const newAdmin = new Admin({
        firebaseId: userRecord.uid,
        name: adminData.data.name,
        email: adminData.data.email,
        phone: adminData.data.phone || '',
        role: adminData.data.role
      });

      await newAdmin.save();
      console.log("Colaborador salvo com sucesso:", newAdmin._id);

      return NextResponse.json(
        { success: true, admin: newAdmin },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Erro ao salvar Administrador:", saveError);

      // Se falhar ao salvar no MongoDB, excluir o usuário criado no Firebase
      try {
        await auth.deleteUser(userRecord.uid);
        console.log("Usuário excluído do Firebase após falha no MongoDB");
      } catch (deleteError) {
        console.error("Erro ao excluir usuário do Firebase:", deleteError);
      }

      // Verificar se é um erro de duplicação
      if (saveError.code === 11000) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao criar Administrador', details: saveError.message },
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
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const uid = decodedToken.uid;
    // Verificar se o usuário é admin no MongoDB
    await connectDB();
    const adminUser = await Admin.findOne({ firebaseId: uid });
    if (!adminUser) {
      return NextResponse.json({ error: 'Usuário não encontrado como administrador' }, { status: 403 });
    }
    if (adminUser.role !== 'Administrador') {
      return NextResponse.json({ error: 'Usuário não tem permissões de administrador' }, { status: 403 });
    }
    
 
    // Obter query params do headers
    const queryUid = request.headers.get('uid');
    const email = request.headers.get('email');

    if (queryUid) {
      // Buscar Administrador pelo UID do Firebase
      const admin = await Admin.findOne({ firebaseId: queryUid });

      if (!admin) {
        return NextResponse.json(
          { error: 'Administrador não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, admin },
        { status: 200 }
      );
    } else if (email) {
      // Buscar Administrador pelo email
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return NextResponse.json(
          { error: 'Administrador não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, admin },
        { status: 200 }
      );
    }
    else {
      // Buscar todos os Administradores
      const admins = await Admin.find();

      return NextResponse.json(
        { success: true, admins },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Erro ao buscar Administrador(es):', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar Administrador(es)', details: error.message },
      { status: 500 }
    );
  }
}