import { NextResponse } from 'next/server';
import connectToDB from "@/lib/db";
import Admin from "@/models/admin";
import { auth } from '@/config/firebase/firebaseAdmin';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token de autenticação não fornecido' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token do Firebase
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 401 });
    }
    
    // Verificar se o usuário está tentando atualizar seu próprio perfil
    if (decodedToken.uid !== id) {
      return NextResponse.json({ message: 'Não autorizado a modificar este perfil' }, { status: 403 });
    }
    
    // Conectar ao MongoDB
    await connectToDB();
    
    // Obter dados do corpo da requisição
    const requestData = await request.json();
    
    // Preparar dados para atualização
    const updateData = {
      name: requestData.name,
      phone: requestData.phone
    };
    
    // Remover campos vazios ou undefined
    Object.keys(updateData).forEach(key => 
      (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
    );
    
    // Atualizar administrador no banco de dados
    const admin = await Admin.findOneAndUpdate(
      { firebaseId: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!admin) {
      return NextResponse.json({ message: 'Administrador não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, admin }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar administrador:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar administrador', details: error.message },
      { status: 500 }
    );
  }
}
