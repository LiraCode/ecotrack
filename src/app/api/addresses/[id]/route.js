import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Address from '@/models/address';
import User from '@/models/user';

// Atualizar endereço existente
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const addressData = await request.json();
    
    // Verificar se o endereço existe
    const address = await Address.findById(id);
    if (!address) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      );
    }
    
    // Se este endereço for definido como padrão, desmarcar outros endereços padrão
    if (addressData.isDefault) {
      await Address.updateMany(
        { clientId: address.clientId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }
    
    // Atualizar endereço
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { $set: addressData },
      { new: true }
    );
    
    return NextResponse.json(
      { success: true, address: updatedAddress },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    
    return NextResponse.json(
      { error: 'Erro ao atualizar endereço', details: error.message },
      { status: 500 }
    );
  }
}

// Excluir endereço
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Verificar se o endereço existe
    const address = await Address.findById(id);
    if (!address) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      );
    }
    
    // Remover referência do endereço no usuário
    await User.findByIdAndUpdate(
      address.clientId,
      { $pull: { addresses: id } }
    );
    
    // Excluir endereço
    await Address.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Endereço excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    
    return NextResponse.json(
      { error: 'Erro ao excluir endereço', details: error.message },
      { status: 500 }
    );
  }
}