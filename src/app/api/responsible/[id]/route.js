import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Responsable from '@/models/responsable';
import { auth } from '@/config/firebase/firebaseAdmin';

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

export async function GET(request, { params }) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = await params;
    
    // Buscar responsável pelo ID
    const responsible = await Responsable.findById(id);
    
    if (!responsible) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, responsible },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar responsável:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar responsável', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = await params;
    const responsibleData = await request.json();
    
    // Buscar responsável para obter o firebaseId
    const existingResponsible = await Responsable.findById(id);
    
    if (!existingResponsible) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar usuário no Firebase Auth usando o Admin SDK
    try {
      const firebaseId = existingResponsible.firebaseId;
      
      // Preparar objeto com dados a serem atualizados no Firebase
      const firebaseUpdateData = {};
      
      if (responsibleData.name) {
        firebaseUpdateData.displayName = responsibleData.name;
      }
      
      if (responsibleData.email && responsibleData.email !== existingResponsible.email) {
        firebaseUpdateData.email = responsibleData.email;
        // Se o email estiver sendo alterado, verificar se já existe
        try {
          await auth.getUserByEmail(responsibleData.email);
          // Se não lançar erro, significa que o email já existe
          return NextResponse.json(
            { error: 'Email já está em uso por outro usuário' },
            { status: 409 }
          );
        } catch (emailError) {
          // Se lançar erro, significa que o email não existe e pode ser usado
          if (emailError.code !== 'auth/user-not-found') {
            throw emailError;
          }
        }
      }
      
      // Se houver dados para atualizar no Firebase
      if (Object.keys(firebaseUpdateData).length > 0) {
        console.log(`Atualizando usuário ${firebaseId} no Firebase:`, firebaseUpdateData);
        await auth.updateUser(firebaseId, firebaseUpdateData);
        
        // Se o email foi alterado, atualizar também no MongoDB
        if (firebaseUpdateData.email) {
          responsibleData.email = firebaseUpdateData.email;
        }
      }
      
      // Se uma nova senha foi fornecida, atualizá-la
      if (responsibleData.password) {
        await auth.updateUser(firebaseId, {
          password: responsibleData.password
        });
        // Não salvar a senha no MongoDB
        delete responsibleData.password;
      }
      
    } catch (firebaseError) {
      console.error('Erro ao atualizar usuário no Firebase:', firebaseError);
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário no Firebase', details: firebaseError.message },
        { status: 500 }
      );
    }
    
    // Atualizar responsável no MongoDB
    const updatedResponsible = await Responsable.findByIdAndUpdate(
      id,
      { $set: responsibleData },
      { new: true }
    );
    
    return NextResponse.json(
      { success: true, responsible: updatedResponsible },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar responsável:', error);
    
    // Verificar se é um erro de duplicação
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email ou CPF já cadastrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar responsável', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = await params;
    
    // Buscar responsável para obter o firebaseId antes de excluir
    const responsible = await Responsable.findById(id);
    
    if (!responsible) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir usuário no Firebase Auth usando o Admin SDK
    try {
      const firebaseId = responsible.firebaseId;
      console.log(`Excluindo usuário ${firebaseId} do Firebase`);
      await auth.deleteUser(firebaseId);
    } catch (firebaseError) {
      // Se o erro for que o usuário não existe no Firebase, continuamos com a exclusão no MongoDB
      if (firebaseError.code !== 'auth/user-not-found') {
        console.error('Erro ao excluir usuário do Firebase:', firebaseError);
        return NextResponse.json(
          { error: 'Erro ao excluir usuário do Firebase', details: firebaseError.message },
          { status: 500 }
        );
      }
    }
    
    // Excluir responsável do MongoDB
    const deletedResponsible = await Responsable.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Responsável excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir responsável:', error);
    
    return NextResponse.json(
      { error: 'Erro ao excluir responsável', details: error.message },
      { status: 500 }
    );
  }
}
