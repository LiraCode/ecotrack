import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Waste from '@/models/waste';

// GET - Fetch all waste types
export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectToDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch specific waste type
    if (id) {
      const waste = await Waste.findById(id);
      
      if (!waste) {
        return NextResponse.json(
          { error: 'Tipo de resíduo não encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: true, waste },
        { status: 200 }
      );
    }
    
    // Otherwise, fetch all waste types
    const wasteTypes = await Waste.find({});
    
    return NextResponse.json(
      { success: true, wasteTypes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar tipos de resíduos:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar tipos de resíduos', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new waste type
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectToDB();
    
    // Get request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.type) {
      return NextResponse.json(
        { error: 'O tipo de resíduo é obrigatório' },
        { status: 400 }
      );
    }
    
    // Validate unique type
    const existingWaste = await Waste.findOne({ type: data.type });
    if (existingWaste) {
      return NextResponse.json(
        { error: 'Tipo de resíduo já existe' },
        { status: 400 }
        );
    }
    
    
    // Create new waste type
    const newWaste = new Waste({
      type: data.type,
      description: data.description || ''
    });
    
    await newWaste.save();
    
    return NextResponse.json(
      { success: true, waste: newWaste },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar tipo de resíduo:', error);
    
    return NextResponse.json(
      { error: 'Erro ao criar tipo de resíduo', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a waste type
export async function PUT(request) {
  try {
    // Connect to MongoDB
    await connectToDB();
    
    // Get request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { error: 'ID do tipo de resíduo é obrigatório' },
        { status: 400 }
      );
    }
    
    // Find and update the waste type
    const updatedWaste = await Waste.findByIdAndUpdate(
      data.id,
      {
        type: data.type,
        description: data.description
      },
      { new: true }
    );
    
    if (!updatedWaste) {
      return NextResponse.json(
        { error: 'Tipo de resíduo não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, waste: updatedWaste },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar tipo de resíduo:', error);
    
    return NextResponse.json(
      { error: 'Erro ao atualizar tipo de resíduo', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a waste type
export async function DELETE(request) {
  try {
    // Connect to MongoDB
    await connectToDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do tipo de resíduo é obrigatório' },
        { status: 400 }
      );
    }
    
    // Find and delete the waste type
    const deletedWaste = await Waste.findByIdAndDelete(id);
    
    if (!deletedWaste) {
      return NextResponse.json(
        { error: 'Tipo de resíduo não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Tipo de resíduo removido com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao remover tipo de resíduo:', error);
    
    return NextResponse.json(
      { error: 'Erro ao remover tipo de resíduo', details: error.message },
      { status: 500 }
    );
  }
}