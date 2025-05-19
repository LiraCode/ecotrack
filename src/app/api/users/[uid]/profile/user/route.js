import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
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

// GET - Buscar perfil do usuário
export async function GET(request, { params }) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Obter o UID dos parâmetros da rota
    const { uid } = await params;
    
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está acessando seus próprios dados ou é um admin
    if (uid !== decodedToken.uid) {
      // Verificar se o usuário é um administrador
      const adminUser = await User.findOne({ 
        firebaseId: decodedToken.uid, 
        role: 'admin' 
      });
      
      if (!adminUser) {
        return NextResponse.json(
          { error: 'Acesso não autorizado' },
          { status: 403 }
        );
      }
    }
    
    // Buscar usuário pelo UID do Firebase
    // Removendo .populate('defaultAddressId') que estava causando o erro
    const user = await User.findOne({ firebaseId: uid })
      .populate('address');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Retornar dados do usuário (excluindo campos sensíveis)
    const userData = {
      _id: user._id,
      firebaseId: user.firebaseId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      role: user.role,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar usuário', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar perfil do usuário
export async function PUT(request, { params }) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Obter o UID dos parâmetros da rota
    const { uid } = await params;
    
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está atualizando seus próprios dados ou é um admin
    if (uid !== decodedToken.uid) {
      // Verificar se o usuário é um administrador
      const adminUser = await User.findOne({ 
        firebaseId: decodedToken.uid, 
        role: 'admin' 
      });
      
      if (!adminUser) {
        return NextResponse.json(
          { error: 'Acesso não autorizado' },
          { status: 403 }
        );
      }
    }
    
    // Buscar usuário pelo UID do Firebase
    const user = await User.findOne({ firebaseId: uid });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Obter dados do corpo da requisição
    const userData = await request.json();
    
    // Campos permitidos para atualização
    const allowedFields = ['name', 'phone', 'cpf'];
    
    // Filtrar apenas os campos permitidos
    const updateData = {};
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    }
    
    // Atualizar o usuário
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true }
    ).populate('address');
    
    // Retornar dados atualizados do usuário (excluindo campos sensíveis)
    const updatedUserData = {
      _id: updatedUser._id,
      firebaseId: updatedUser.firebaseId,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      cpf: updatedUser.cpf,
      role: updatedUser.role,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
    
    return NextResponse.json(updatedUserData);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário', details: error.message },
      { status: 500 }
    );
  }
}
