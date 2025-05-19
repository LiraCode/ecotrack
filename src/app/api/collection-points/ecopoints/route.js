import connectToDB from '@/lib/db';
import CollectionPoint from '@/models/collectionPoint';
import  '@/models/address';
import  '@/models/waste';
import  '@/models/responsable';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB();
    
    // Buscar todos os pontos de coleta com seus endereços
    const ecopoints = await CollectionPoint.find()
      .populate('address')
      .populate('typeOfWasteId')
      .populate('responsableId');
    
    console.log('Ecopoints encontrados:', ecopoints.length); // Para debug
    
    // Garantir que estamos retornando um array, mesmo que vazio
    return NextResponse.json({ ecopoints: ecopoints || [] });
  } catch (error) {
    console.error('Error fetching ecopoints:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar ecopontos', error: error.message, ecopoints: [] },
      { status: 500 }
    );
  }
}