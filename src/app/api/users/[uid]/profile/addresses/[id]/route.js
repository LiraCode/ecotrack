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

// PUT - Atualizar um endereço específico
export async function PUT(request, context) {
  try {
    // Obter parâmetros da URL
    const { uid, id } = context.params;
    
    // Conectar ao banco de dados
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está atualizando seu próprio endereço ou é admin
    if (decodedToken.uid !== uid) {
      // Verificar se o usuário é admin
      const adminUser = await User.findOne({ firebaseId: decodedToken.uid });
      if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ message: 'Não autorizado a editar endereços de outros usuários' }, { status: 403 });
      }
    }
    
    // Validar o ID do endereço
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de endereço inválido' }, { status: 400 });
    }
    
    // Buscar o usuário pelo firebaseId
    const user = await User.findOne({ firebaseId: uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o endereço pertence ao usuário
    const addressExists = await Address.findById(id);
    if (!addressExists) {
      return NextResponse.json({ message: 'Endereço não encontrado' }, { status: 404 });
    }
    
    // Verificar se o endereço está na lista de endereços do usuário
    if (!user.address.includes(id)) {
      return NextResponse.json({ message: 'Endereço não pertence ao usuário' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const addressData = await request.json();
    
    // Validar dados obrigatórios
    const requiredFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json(
          { message: `Campo obrigatório: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Se este endereço for definido como padrão, remover o padrão de outros endereços
    if (addressData.isDefault) {
      await Address.updateMany(
        { _id: { $in: user.address }, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }
    
    // Atualizar o endereço
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement || '',
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        isDefault: addressData.isDefault || false
      },
      { new: true } // Retornar o documento atualizado
    );
    
    if (!updatedAddress) {
      return NextResponse.json({ message: 'Falha ao atualizar endereço' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Endereço atualizado com sucesso',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar endereço', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um endereço específico
export async function DELETE(request, context) {
  try {
    // Obter parâmetros da URL
    const { uid, id } = context.params;
    
    // Conectar ao banco de dados
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está excluindo seu próprio endereço ou é admin
    if (decodedToken.uid !== uid) {
      // Verificar se o usuário é admin
      const adminUser = await User.findOne({ firebaseId: decodedToken.uid });
      if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ message: 'Não autorizado a excluir endereços de outros usuários' }, { status: 403 });
      }
    }
    
    // Validar o ID do endereço
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de endereço inválido' }, { status: 400 });
    }
    
    // Buscar o usuário pelo firebaseId
    const user = await User.findOne({ firebaseId: uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o endereço pertence ao usuário
    if (!user.address.includes(id)) {
      return NextResponse.json({ message: 'Endereço não pertence ao usuário' }, { status: 403 });
    }
    
    // Excluir o endereço
    const deletedAddress = await Address.findByIdAndDelete(id);
    if (!deletedAddress) {
      return NextResponse.json({ message: 'Falha ao excluir endereço' }, { status: 500 });
    }
    
    // Remover o endereço da lista de endereços do usuário
    user.address = user.address.filter(addressId => addressId.toString() !== id);
    await user.save();
    
    return NextResponse.json({
      message: 'Endereço excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir endereço', error: error.message },
      { status: 500 }
    );
  }
}

// GET - Obter um endereço específico
export async function GET(request, context) {
  try {
    // Obter parâmetros da URL
    const { uid, id } = context.params;
    
    // Conectar ao banco de dados
    await connectToDB();
    
    // Verificar autenticação com Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está acessando seu próprio endereço ou é admin
    if (decodedToken.uid !== uid) {
      // Verificar se o usuário é admin
      const adminUser = await User.findOne({ firebaseId: decodedToken.uid });
      if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ message: 'Não autorizado a acessar endereços de outros usuários' }, { status: 403 });
      }
    }
    
    // Validar o ID do endereço
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de endereço inválido' }, { status: 400 });
    }
    
    // Buscar o usuário pelo firebaseId
    const user = await User.findOne({ firebaseId: uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o endereço pertence ao usuário
    if (!user.address.includes(id)) {
      return NextResponse.json({ message: 'Endereço não pertence ao usuário' }, { status: 403 });
    }
    
    // Buscar o endereço
    const address = await Address.findById(id);
    if (!address) {
      return NextResponse.json({ message: 'Endereço não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(address);
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar endereço', error: error.message },
      { status: 500 }
    );
  }
}