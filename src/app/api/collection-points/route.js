import connectToDB from '@/lib/db';
import CollectionPoint from '@/models/collectionPoint';
import Address from '@/models/address';
import  '@/models/waste';
import  '@/models/responsable';
import { NextResponse } from 'next/server';

// GET - Buscar todos os ecopontos
export async function GET() {
  try {
    await connectToDB();
    
    const collectionPoints = await CollectionPoint.find({})
      .populate('responsableId')
      .populate('typeOfWasteId')
      .populate('address');
      console.log('Collection Points:', collectionPoints);
    
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
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    const { address, ...collectionPointData } = body;
    
    // Primeiro criar o endereço
    const newAddress = new Address(address);
    await newAddress.save();
    
    // Depois criar o ecoponto com a referência do endereço
    const collectionPoint = new CollectionPoint({
      ...collectionPointData,
      address: newAddress._id
    });
    
    await collectionPoint.save();
    
    // Retornar o ecoponto criado com os dados populados
    const populatedCollectionPoint = await CollectionPoint.findById(collectionPoint._id)
      .populate('responsableId')
      .populate('typeOfWasteId')
      .populate('address');
    
    return NextResponse.json(populatedCollectionPoint, { status: 201 });
  } catch (error) {
    console.error('Error creating collection point:', error);
    return NextResponse.json(
      { message: 'Erro ao criar ecoponto', error: error.message },
      { status: 500 }
    );
  }
}