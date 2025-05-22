import connectToDB from '@/lib/db';
import User from '@/models/user';
import Address from '@/models/address';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

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

// GET - Buscar um endereço específico
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Validar o ID do endereço
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de endereço inválido' }, { status: 400 });
    }
    
    // Buscar o endereço
    const address = await Address.findById(id);
    
    if (!address) {
      return NextResponse.json({ message: 'Endereço não encontrado' }, { status: 404 });
    }
    
    // Buscar o usuário pelo ID do Firebase para obter o ID do MongoDB
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    
    // Verificar se o endereço pertence ao usuário ou se o usuário é admin
    if (!user || (address.userId.toString() !== user._id.toString() && user.role !== 'Administrador')) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    
    return NextResponse.json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar endereço', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um endereço específico
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Validar o ID do endereço
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de endereço inválido' }, { status: 400 });
    }
    
    // Buscar o endereço
    const address = await Address.findById(id);
    
    if (!address) {
      return NextResponse.json({ message: 'Endereço não encontrado' }, { status: 404 });
    }
    
    // Buscar o usuário pelo ID do Firebase para obter o ID do MongoDB
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    
    // Verificar se o endereço pertence ao usuário ou se o usuário é admin
    if (!user || (address.userId.toString() !== user._id.toString() && user.role !== 'admin')) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Campos permitidos para atualização
    const allowedFields = ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipCode', 'isDefault'];
    
    // Filtrar apenas os campos permitidos
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Se este endereço for definido como padrão, remover o padrão de outros endereços
    if (updateData.isDefault) {
      await Address.updateMany(
        { userId: user._id, _id: { $ne: id }, isDefault: true },
        { $set: { isDefault: false } }
      );
      
      // Atualizar o endereço padrão do usuário
      await User.findByIdAndUpdate(user._id, { defaultAddressId: id });
    }
    
    // Atualizar o endereço
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar endereço', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um endereço específico
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Validar o ID do endereço
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de endereço inválido' }, { status: 400 });
    }
    
    // Buscar o endereço
    const address = await Address.findById(id);
    
    if (!address) {
      return NextResponse.json({ message: 'Endereço não encontrado' }, { status: 404 });
    }
    
    // Buscar o usuário pelo ID do Firebase para obter o ID do MongoDB
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    
    // Verificar se o endereço pertence ao usuário ou se o usuário é admin
    if (!user || (address.userId.toString() !== user._id.toString() && user.role !== 'admin')) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Verificar se é o endereço padrão do usuário
    if (user.defaultAddressId && user.defaultAddressId.toString() === id) {
      // Buscar outro endereço para definir como padrão
      const otherAddress = await Address.findOne({ 
        userId: user._id, 
        _id: { $ne: id } 
      }).sort({ createdAt: -1 });
      
      if (otherAddress) {
        // Definir outro endereço como padrão
        await Address.findByIdAndUpdate(otherAddress._id, { isDefault: true });
        await User.findByIdAndUpdate(user._id, { defaultAddressId: otherAddress._id });
      } else {
        // Se não houver outro endereço, remover a referência ao endereço padrão
        await User.findByIdAndUpdate(user._id, { $unset: { defaultAddressId: 1 } });
      }
    }
    
    // Excluir o endereço
    await Address.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Endereço excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir endereço', error: error.message },
      { status: 500 }
    );
  }
}