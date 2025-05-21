import { NextResponse } from 'next/server';
import connectToDB from "@/lib/db";
import Responsable from "@/models/responsable";
import CollectionPoint from "@/models/collectionPoint";
import  '@/models/address';
import  '@/models/waste';
import { auth } from '@/config/firebase/firebaseAdmin';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Verificar autenticação do usuário
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário está tentando acessar seus próprios dados
    if (decodedToken.uid !== id) {
      return NextResponse.json({ message: 'Não autorizado a acessar estes dados' }, { status: 403 });
    }
    
    // Conectar ao MongoDB
    await connectToDB();
    
    // Buscar o responsável pelo UID
    const responsable = await Responsable.findOne({ firebaseId: id });
    
    if (!responsable) {
      return NextResponse.json({ message: 'Responsável não encontrado' }, { status: 404 });
    }
    
    // Buscar ecopontos associados ao responsável
    const organizations = await CollectionPoint.find({ responsableId: responsable._id })
      .populate('address')
      .populate('typeOfWasteId');
    
    return NextResponse.json({ success: true, organizations }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar organizações do responsável:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar organizações do responsável', error: error.message },
      { status: 500 }
    );
  }
}

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
