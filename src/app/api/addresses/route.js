import connectToDB from '@/lib/db';
import User from '@/models/user';
import Address from '@/models/address';
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

// POST - Criar um novo endereço
export async function POST(request) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Buscar o usuário pelo ID do Firebase para obter o ID do MongoDB
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados obrigatórios
    const requiredFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Campo obrigatório: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Se este endereço for definido como padrão, remover o padrão de outros endereços
    if (body.isDefault) {
      await Address.updateMany(
        { userId: user._id, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Criar o novo endereço
    const newAddress = new Address({
      userId: user._id,
      street: body.street,
      number: body.number,
      complement: body.complement || '',
      neighborhood: body.neighborhood,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      isDefault: body.isDefault || false
    });
    
    await newAddress.save();
    
    // Se for o primeiro endereço ou for definido como padrão, atualizar o endereço padrão do usuário
    if (body.isDefault || (await Address.countDocuments({ userId: user._id })) === 1) {
      await User.findByIdAndUpdate(user._id, { defaultAddressId: newAddress._id });
    }
    
    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { message: 'Erro ao criar endereço', error: error.message },
      { status: 500 }
    );
  }
}

// Buscar endereços de um usuário
export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    
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
    
    // Buscar endereços pelo ID do MongoDB
    const addresses = await Address.find({ clientId: user._id });
    
    return NextResponse.json(
      { success: true, addresses },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar endereços', details: error.message },
      { status: 500 }
    );
  }
}