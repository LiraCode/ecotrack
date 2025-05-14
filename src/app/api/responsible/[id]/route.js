import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Responsible from '@/models/responsable';

export async function GET(request, { params }) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    
    // Buscar responsável pelo ID
    const responsible = await Responsible.findById(id);
    
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
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    const responsibleData = await request.json();
    
    // Atualizar responsável no MongoDB
    const updatedResponsible = await Responsible.findByIdAndUpdate(
      id,
      { $set: responsibleData },
      { new: true }
    );
    
    if (!updatedResponsible) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }
    
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
    // Conectar ao MongoDB
    await connectDB();
    
    const { id } = params;
    
    // Excluir responsável
    const deletedResponsible = await Responsible.findByIdAndDelete(id);
    
    if (!deletedResponsible) {
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
