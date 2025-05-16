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

// GET - Buscar endereços de um usuário
export async function GET(request, context) {
  try {
    // Obter parâmetros de forma assíncrona
    const { uid } = await context.params;
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está acessando seus próprios endereços ou é admin
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se é o próprio usuário ou um admin
    if (decodedToken.uid !== uid && user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    // Buscar o usuário pelo firebaseId
    const targetUser = await User.findOne({ firebaseId: uid });
    
    if (!targetUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Buscar os endereços do usuário
    const addresses = await Address.find({ _id: { $in: targetUser.address } });
    
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar endereços do usuário', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Adicionar um novo endereço para o usuário
export async function POST(request, context) {
  try {
    // Obter parâmetros de forma assíncrona
    const { params } = context;
    const uid = params.uid;
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está adicionando endereço para si mesmo ou é admin
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se é o próprio usuário ou um admin
    if (decodedToken.uid !== uid && user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    // Buscar o usuário pelo firebaseId
    const targetUser = await User.findOne({ firebaseId: uid });
    
    if (!targetUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const addressData = await request.json();
    
    // Criar o novo endereço
    const newAddress = new Address(addressData);
    await newAddress.save();
    
    // Adicionar o endereço ao usuário
    targetUser.address.push(newAddress._id);
    await targetUser.save();
    
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error adding user address:', error);
    return NextResponse.json(
      { message: 'Erro ao adicionar endereço do usuário', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um endereço específico
export async function PUT(request, context) {
  try {
    // Obter parâmetros de forma assíncrona
   
    const uid = context.uid;
    
    const { addressId, ...addressData } = await request.json();
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está atualizando seu próprio endereço ou é admin
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se é o próprio usuário ou um admin
    if (decodedToken.uid !== uid && user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    // Buscar o usuário pelo firebaseId
    const targetUser = await User.findOne({ firebaseId: uid });
    
    if (!targetUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o endereço pertence ao usuário
    if (!targetUser.address.includes(addressId)) {
      return NextResponse.json({ message: 'Endereço não encontrado para este usuário' }, { status: 404 });
    }
    
    // Atualizar o endereço
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      addressData,
      { new: true }
    );
    
    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating user address:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar endereço do usuário', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover um endereço específico
export async function DELETE(request, context) {
  try {
    // Obter parâmetros de forma assíncrona
    const { uid } = await context.params;
    const { addressId } = await request.json();
    
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está removendo seu próprio endereço ou é admin
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se é o próprio usuário ou um admin
    if (decodedToken.uid !== uid && user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    // Buscar o usuário pelo firebaseId
    const targetUser = await User.findOne({ firebaseId: uid });
    
    if (!targetUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o endereço pertence ao usuário
    if (!targetUser.address.includes(addressId)) {
      return NextResponse.json({ message: 'Endereço não encontrado para este usuário' }, { status: 404 });
    }
    
    // Remover o endereço da lista do usuário
    targetUser.address = targetUser.address.filter(id => id.toString() !== addressId);
    await targetUser.save();
    
    // Excluir o endereço
    await Address.findByIdAndDelete(addressId);
    
    return NextResponse.json({ message: 'Endereço removido com sucesso' });
  } catch (error) {
    console.error('Error deleting user address:', error);
    return NextResponse.json(
      { message: 'Erro ao remover endereço do usuário', error: error.message },
      { status: 500 }
    );
  }
}
