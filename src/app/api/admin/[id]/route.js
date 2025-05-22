import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/admin';
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
    
    // Buscar administrador pelo ID
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'administrador não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, admin },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar administrador:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar administrador', details: error.message },
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
    const adminData = await request.json();
    
    // Buscar administrador para obter o firebaseId
    const existingAdmin = await Admin.findById(id);
    
    if (!existingAdmin) {
      return NextResponse.json(
        { error: 'Administrador não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar usuário no Firebase Auth usando o Admin SDK
    try {
      const firebaseId = existingAdmin.firebaseId;
      
      // Preparar objeto com dados a serem atualizados no Firebase
      const firebaseUpdateData = {};
      
      if (adminData.name) {
        firebaseUpdateData.displayName = adminData.name;
      }
      
      if (adminData.email && adminData.email !== existingAdmin.email) {
        firebaseUpdateData.email = adminData.email;
        // Se o email estiver sendo alterado, verificar se já existe
        try {
          await auth.getUserByEmail(adminData.email);
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
          adminData.email = firebaseUpdateData.email;
        }
      }
      
      // Se uma nova senha foi fornecida, atualizá-la
      if (adminData.password) {
        await auth.updateUser(firebaseId, {
          password: adminData.password
        });
        // Não salvar a senha no MongoDB
        delete adminData.password;
      }
      
      // Atualizar claims personalizadas se o papel (role) foi alterado
      if (adminData.role && adminData.role !== existingAdmin.role) {
        await auth.setCustomUserClaims(firebaseId, {
          role: adminData.role
        });
      }
      
    } catch (firebaseError) {
      console.error('Erro ao atualizar usuário no Firebase:', firebaseError);
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário no Firebase', details: firebaseError.message },
        { status: 500 }
      );
    }
    
    // Atualizar administrador no MongoDB
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: adminData },
      { new: true }
    );
    
    return NextResponse.json(
      { success: true, admin: updatedAdmin },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar administrador:', error);
    
    // Verificar se é um erro de duplicação
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar administrador', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  console.log("DELETE request received");
  try {
    // Verificar autenticação
    const decodedToken = await verifyFirebaseToken(request);
    console.log('Token decodificado:', decodedToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = await params;
    
    // Buscar administrador para obter o firebaseId antes de excluir
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Administrador não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir usuário no Firebase Auth usando o Admin SDK
    try {
      const firebaseId = admin.firebaseId;
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
    
    // Excluir administrador do MongoDB
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Administrador excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir administrador:', error);
    
    return NextResponse.json(
      { error: 'Erro ao excluir administrador', details: error.message },
      { status: 500 }
    );
  }
}
