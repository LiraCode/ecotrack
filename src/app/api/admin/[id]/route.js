import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/admin';

export async function GET(request, { params }) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    
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
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    const adminData = await request.json();
    
    // Atualizar administrador no MongoDB
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: adminData },
      { new: true }
    );
    
    if (!updatedAdmin) {
      return NextResponse.json(
        { error: 'administrador não encontrado' },
        { status: 404 }
      );
    }
    
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
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    
    // Excluir administrador
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    
    if (!deletedAdmin) {
      return NextResponse.json(
        { error: 'administrador não encontrado' },
        { status: 404 }
      );
    }
    
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