import connectToDB from '@/lib/db';
import  Responsable from '@/models/responsable';
import { auth } from '@/config/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  const { method } = req;
  const { uid } = req.query;
  
  await connectToDB();
  
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
 const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
  
  switch (method) {
    case 'GET':
      try {
        const responsable = await Responsable.findOne({ uid });
        
        if (!responsable) {
          return res.status(404).json({ success: false, message: 'Responsável não encontrado' });
        }
        
        res.status(200).json({ success: true, responsable });
      } catch (error) {
        console.error('Erro ao buscar responsável:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar responsável' });
      }
      break;
      
    case 'PUT':
      try {
        const updateData = {
          name: req.body.name,
          phone: req.body.phone,
          position: req.body.position,
          organization: req.body.organization,
          cnpj: req.body.cnpj,
          sector: req.body.sector,
          businessPhone: req.body.businessPhone
        };
        
        // Remover campos vazios ou undefined
        Object.keys(updateData).forEach(key => 
          (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
        );
        
        const responsable = await Responsable.findOneAndUpdate(
          { uid },
          updateData,
          { new: true, runValidators: true }
        );
        
        if (!responsable) {
          return res.status(404).json({ success: false, message: 'Responsável não encontrado' });
        }
        
        res.status(200).json({ success: true, responsable });
      } catch (error) {
        console.error('Erro ao atualizar responsável:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar responsável' });
      }
      break;
      
    default:
      res.status(405).json({ success: false, message: 'Método não permitido' });
      break;
  }
}