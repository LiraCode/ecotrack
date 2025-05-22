import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import User from '@/models/user';
import { auth } from '@/config/firebase/firebaseAdmin';

// Função para verificar token do Firebase
async function verifyFirebaseToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
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

// GET - Obter usuários (um específico por UID ou email, ou todos)
export async function GET(request) {
  try {
    // Conectar ao MongoDB
    await connectToDB();
    
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const email = searchParams.get('email');
    
    // Verificar autenticação para acesso a todos os usuários
    if (!uid && !email) {
      const decodedToken = await verifyFirebaseToken(request);
      if (!decodedToken) {
        return NextResponse.json(
          { error: 'Não autorizado a acessar todos os usuários' },
          { status: 401 }
        );
      }
      
      // Verificar se o usuário tem permissão para listar todos (opcional)
      // Aqui você pode adicionar lógica para verificar se o usuário é admin
    }
    
    if (uid) {
      // Buscar usuário pelo UID do Firebase
      const user = await User.findOne({ firebaseId: uid });
      
      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ user }, { status: 200 });
    } else if (email) {
      // Buscar usuário pelo email
      const user = await User.findOne({ email });
      
      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ user }, { status: 200 });
    } else {
      // Buscar todos os usuários
      const users = await User.find().sort({ name: 1 });
      
      return NextResponse.json({ users }, { status: 200 });
    }
  } catch (error) {
    console.error('Erro ao buscar usuário(s):', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar usuário(s)', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request) {
  try {
    // Conectar ao MongoDB
    await connectToDB();
    
    // Obter dados do corpo da requisição
    const userData = await request.json();
    
    // Validar dados básicos
    if (!userData.firebaseId || !userData.name || !userData.email) {
      return NextResponse.json(
        { error: 'ID do Firebase, nome e email são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ 
      $or: [
        { firebaseId: userData.firebaseId },
        { email: userData.email }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já cadastrado' },
        { status: 409 }
      );
    }
    
    // Criar novo usuário
    const newUser = new User({
      firebaseId: userData.firebaseId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      cpf: userData.cpf || '',
      // Outros campos conforme necessário
    });
    
    await newUser.save();
    
    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    // Verificar se é um erro de duplicação
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email ou CPF já cadastrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário existente
export async function PUT(request) {
  try {
    // Conectar ao MongoDB
    await connectToDB();
    
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Não autorizado a modificar usuários' },
        { status: 401 }
      );
    }
    
    // Obter dados do corpo da requisição
    const userData = await request.json();
    
    if (!userData.uid) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário está tentando atualizar seu próprio perfil
    if (decodedToken.uid !== userData.uid) {
      // Aqui você pode adicionar lógica para permitir que admins atualizem outros usuários
      return NextResponse.json(
        { error: 'Não autorizado a modificar este usuário' },
        { status: 403 }
      );
    }
    
    // Preparar dados para atualização
    const updateData = {
      name: userData.name,
      phone: userData.phone,
      // Não permitir atualização de email ou firebaseId
    };
    
    // Adicionar CPF apenas se for fornecido e não estiver vazio
    if (userData.cpf) {
      updateData.cpf = userData.cpf;
    }
    
    // Remover campos vazios ou undefined
    Object.keys(updateData).forEach(key => 
      (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
    );
    
    // Atualizar usuário
    const updatedUser = await User.findOneAndUpdate(
      { firebaseId: userData.uid },
      updateData,
      { new: true, runValidators: true }
    );
    
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
    
    // Verificar se é um erro de duplicação
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'CPF já cadastrado para outro usuário' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request) {
  try {
    // Conectar ao MongoDB
    await connectToDB();
    
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Não autorizado a excluir usuários' },
        { status: 401 }
      );
    }
    
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário está tentando excluir seu próprio perfil
    // ou se é um admin (lógica adicional pode ser implementada)
    if (decodedToken.uid !== uid) {
      // Verificar se o usuário é admin
      // Implementar lógica conforme necessário
    }
    
    // Excluir usuário
    const deletedUser = await User.findOneAndDelete({ firebaseId: uid });
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Usuário excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro ao excluir usuário', details: error.message },
      { status: 500 }
    );
  }
}