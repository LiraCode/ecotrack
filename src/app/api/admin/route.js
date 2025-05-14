import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/admin';
import { auth } from '@/config/firebase/firebaseAdmin';

export async function POST(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
  try {
     // Verificar token do Firebase
            const decodedToken = await auth.verifyIdToken(token);
            const key  = decodedToken.uid;
            console.log("Token decodificado:", key);
    console.log("Iniciando processamento da requisição POST /api/admin");
    
    // Conectar ao MongoDB
    await connectDB();
    console.log("Conexão com MongoDB estabelecida");
    
    // Obter dados da requisição
    const adminData = await request.json();
    console.log("Dados recebidos:", JSON.stringify(adminData));
    
    // Validar dados básicos
    if (!adminData.firebaseId||!adminData.name || !adminData.email || !adminData.role) {
      console.error("Dados obrigatórios ausentes");
      return NextResponse.json(
        { error: 'Nome, email e função são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Criar novo Administrador no MongoDB
    try {
      console.log("Tentando criar Administrador no MongoDB");
      const newAdmin = new Admin({
        firebaseId: adminData.firebaseId,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone || '',
        role: adminData.role
      });
      
      await newAdmin.save();
      console.log("Colaborador salvo com sucesso:", newAdmin._id);
      
      return NextResponse.json(
        { success: true, admin: newAdmin },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Erro ao salvar Administrador:", saveError);
      
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
    // Conectar ao MongoDB
    await connectDB();
    
    // Obter query params do headers
    const uid = request.headers.get('uid');
    const email = request.headers.get('email');

    if(uid) {
      // Buscar Administrador pelo UID do Firebase
      const admin = await Admin.findOne({ firebaseId: uid });

      if (!admin) {
        return NextResponse.json(
          { error: 'Colaborador não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, admin },
        { status: 200 }
      );
    }else if (email) {
      // Buscar Administrador pelo email
      const admin = await Admin.findOne({ email });
      
      if (!admin) {
        return NextResponse.json(
          { error: 'admin não encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: true, admin },
        { status: 200 }
      );
    } 
    // else {
    //   // Buscar todos os Administradores
    //   const admins = await Admin.find();
      
    //   return NextResponse.json(
    //     { success: true, admins },
    //     { status: 200 }
    //   );
    // }
  } catch (error) {
    console.error('Erro ao buscar Administrador(es):', error);
    
    return NextResponse.json(
      { sucess:false, error: 'Erro ao buscar Administrador(es)', details: error.message },
      { status: 500 }
    );
  }
}