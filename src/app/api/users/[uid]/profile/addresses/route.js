import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Address from '@/models/address';
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

// GET - Buscar endereços do usuário
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
    const user = await User.findOne({ firebaseId: uid });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Buscar endereços do usuário
    const addresses = await Address.find({ userId: user._id })
      .sort({ isDefault: -1, createdAt: -1 });
    
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar endereços', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo endereço
export async function POST(request, { params }) {
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
    
    // Verificar se o usuário está adicionando endereço para si mesmo ou é um admin
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
    const addressData = await request.json();
    
    // Validar dados obrigatórios
    const requiredFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Se este endereço for definido como padrão, remover o padrão de outros endereços
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId: user._id, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Criar o novo endereço
    const newAddress = new Address({
      userId: user._id,
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement || '',
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      isDefault: addressData.isDefault || false
    });
    
    await newAddress.save();
    
    // Se for o primeiro endereço ou for definido como padrão, atualizar o endereço padrão do usuário
    if (addressData.isDefault || (await Address.countDocuments({ userId: user._id })) === 1) {
      await User.findByIdAndUpdate(user._id, { defaultAddressId: newAddress._id });
    }
    
    return NextResponse.json(
      { success: true, address: newAddress },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    
    return NextResponse.json(
      { error: 'Erro ao criar endereço', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover todos os endereços (com cuidado!)
export async function DELETE(request, { params }) {
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
    
    // Apenas administradores podem excluir todos os endereços de um usuário
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
    
    // Remover todos os endereços do usuário
    const result = await Address.deleteMany({ userId: user._id });
    
    // Remover referência ao endereço padrão do usuário
    await User.findByIdAndUpdate(user._id, { $unset: { defaultAddressId: 1 } });
    
    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} endereços removidos com sucesso`
    });
  } catch (error) {
    console.error('Erro ao remover endereços:', error);
    
    return NextResponse.json(
      { error: 'Erro ao remover endereços', details: error.message },
      { status: 500 }
    );
  }
}
