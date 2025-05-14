import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Address from '@/models/address';

export async function GET(request) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Obter o UID da query string
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid') ? searchParams.get('uid') : request.headers.get('uid');
    console.log("UID recebido:", uid);
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID não fornecido' },
        { status: 400 }
      );
    }
    
    // Buscar usuário pelo UID do Firebase (armazenado como firebaseId)
    // Populate the address field to get the full address details
    const user = await User.findOne({ firebaseId: uid }).populate('address');
    
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
