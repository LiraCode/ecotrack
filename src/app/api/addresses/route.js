import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Address from '@/models/address';
import User from '@/models/user';

// Criar novo endereço
export async function POST(request) {
  try {
    await connectDB();
    
    const addressData = await request.json();
    
    // Criar novo endereço
    const newAddress = new Address({
      street: addressData.street ,
      number: addressData.number ,
      complement: addressData.complement ,
      neighborhood: addressData.neighborhood ,
      city: addressData.city ,
      state: addressData.state,
      zipCode: addressData.zipCode,
      isDefault: addressData.isDefault || true
    });
    
    await newAddress.save();
    console.log("Endereço salvo com sucesso:", newAddress._id);
    
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

// Buscar endereços de um usuário
export async function GET(request) {
  try {
    await connectDB();
    
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