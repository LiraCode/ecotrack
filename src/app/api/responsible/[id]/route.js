import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Responsable from '@/models/responsable';

export async function GET(request, { params }) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = await params;
    
    // Buscar responsável pelo ID
    const responsable = await Responsable.findById(id);
    
    if (!responsable) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, responsable },
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
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    const responsableData = await request.json();
    
    // Atualizar responsável no MongoDB
    const updatedResponsable = await Responsable.findByIdAndUpdate(
      id,
      { $set: responsableData },
      { new: true }
    );
    
    if (!updatedResponsable) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, responsable: updatedResponsable },
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
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    
    // Excluir responsável
    const deletedResponsable = await Responsable.findByIdAndDelete(id);
    
    if (!deletedResponsable) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
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
