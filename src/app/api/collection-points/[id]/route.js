import connectToDB from '@/lib/db';
import CollectionPoint from '@/models/collectionPoint';
import Address from '@/models/address';
import { NextResponse } from 'next/server';

// GET - Buscar um ecoponto específico
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDB();
    
    // Buscar o ecoponto pelo ID
    const collectionPoint = await CollectionPoint.findById(id)
      .populate('address')
      .populate('typeOfWasteId')
      .populate('responsableId');
    
    if (!collectionPoint) {
      return NextResponse.json(
        { message: 'Ecoponto não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, collectionPoint });
  } catch (error) {
    console.error('Error fetching collection point:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar ecoponto', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um ecoponto específico
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectToDB();
    // Obter dados do corpo da requisição
    const body = await request.json();
    const { address, ...collectionPointData } = body;

    // Buscar o ecoponto existente
    const existingPoint = await CollectionPoint.findById(id);
    if (!existingPoint) {
      return NextResponse.json(
        { message: 'Ecoponto não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o endereço se fornecido
    if (address) {
      await Address.findByIdAndUpdate(existingPoint.address, address);
    }

    // Atualizar o ecoponto
    const updatedPoint = await CollectionPoint.findByIdAndUpdate(
      id,
      collectionPointData,
      { new: true }
    )
      .populate('responsableId')
      .populate('typeOfWasteId')
      .populate('address');

    return NextResponse.json(updatedPoint);
  } catch (error) {
    console.error('Error updating collection point:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar ecoponto', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover um ecoponto específico
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectToDB();

    // Buscar o ecoponto
    const collectionPoint = await CollectionPoint.findById(id);
    if (!collectionPoint) {
      return NextResponse.json(
        { message: 'Ecoponto não encontrado' },
        { status: 404 }
      );
    }

    // Remover o endereço associado
    await Address.findByIdAndDelete(collectionPoint.address);

    // Remover o ecoponto
    await CollectionPoint.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Ecoponto removido com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting collection point:', error);
    return NextResponse.json(
      { message: 'Erro ao remover ecoponto', error: error.message },
      { status: 500 }
    );
  }
}
