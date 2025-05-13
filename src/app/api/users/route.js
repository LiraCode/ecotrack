import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';

export async function POST(request) {
  try {
    console.log("Iniciando processamento da requisição POST /api/users");
    
    // Conectar ao MongoDB
    await connectDB();
    console.log("Conexão com MongoDB estabelecida");
    
    // Obter dados da requisição
    const userData = await request.json();
    console.log("Dados recebidos:", JSON.stringify(userData));

    
    // Criar novo usuário no MongoDB
    try {
      console.log("Tentando criar usuário no MongoDB com endereços:", userData.address);
      const newUser = new User({
        firebaseId: userData.firebaseId,
        cpf: userData.cpf,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        address: userData.address,
      });
      
      await newUser.save();
      console.log("Usuário salvo com sucesso:", newUser._id);
      
      return NextResponse.json(
        { success: true, user: newUser },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Erro ao salvar usuário:", saveError);
      
      // Verificar se é um erro de duplicação
      if (saveError.code === 11000) {
        return NextResponse.json(
          { error: 'Email ou CPF já cadastrado' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao criar usuário', details: saveError.message },
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

// Adicionar rota GET para buscar usuário pelo UID do Firebase
export async function GET(request) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Obter o UID da query string
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid')? searchParams.get('uid') : request.headers.get('uid');
    console.log("UID recebido:", uid);
    
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID não fornecido' },
        { status: 400 }
      );
    }
    
    // Buscar usuário pelo UID do Firebase (armazenado como firebaseId)
    const user = await User.findOne({ firebaseId: uid });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar usuário', details: error.message },
      { status: 500 }
    );
  }
}

// Adicionar rota PUT para atualizar usuário
export async function PUT(request) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    const userData = await request.json();
    
    // Verificar se o UID foi fornecido
    if (!userData.uid) {
      return NextResponse.json(
        { error: 'UID não fornecido' },
        { status: 400 }
      );
    }
    
    // Remover campos que não devem ser atualizados
    const { uid, ...updateData } = userData;
    
    // Atualizar usuário no MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { firebaseId: uid }, // Buscar pelo firebaseId
      { $set: updateData },
      { new: true }
    ).populate('addresses');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    // Verificar se é um erro de duplicação (email ou CPF já existente)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email ou CPF já cadastrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário', details: error.message },
      { status: 500 }
    );
  }
}
