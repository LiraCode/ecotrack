import connectToDB from '@/lib/db';
import CollectionPoint from '@/models/collectionPoint';
import Address from '@/models/address';
import '@/models/waste';
import { NextResponse } from 'next/server';


// GET - Buscar todos os ecopontos
export async function GET() {
  try {
    await connectToDB();
    
    const collectionPoints = await CollectionPoint.find({})
      .populate('responsableId')
      .populate('typeOfWasteId')
      .populate('address');
    
    return NextResponse.json(collectionPoints);
  } catch (error) {
    console.error('Error fetching collection points:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar ecopontos', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar um novo ecoponto
export async function POST(request) {
  try {
    await connectToDB();
    
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.cnpj || !data.name || !data.responsableId || !data.lat || !data.lng) {
      return NextResponse.json(
        { message: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Criar endereço primeiro
    const address = new Address(data.address);
    const savedAddress = await address.save();

    // Criar collection point
    const collectionPointData = {
      ...data,
      address: savedAddress._id,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng)
    };

    const collectionPoint = new CollectionPoint(collectionPointData);
    const savedCollectionPoint = await collectionPoint.save();

    // Buscar o collection point completo com populate
    const populatedCollectionPoint = await CollectionPoint.findById(savedCollectionPoint._id)
      .populate('responsableId', 'name email')
      .populate('typeOfWasteId', 'type name')
      .populate('address');
    
    return NextResponse.json(populatedCollectionPoint, { status: 201 });
  } catch (error) {
    console.error('Error creating collection point:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'CNPJ já cadastrado' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Erro ao criar ecoponto', error: error.message },
      { status: 500 }
    );
  }
}