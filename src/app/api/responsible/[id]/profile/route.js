import { NextResponse } from 'next/server';
import connectToDB from "@/lib/db";
import Responsable from "@/models/responsable";
import '@/models/address';
import '@/models/waste';
import { auth } from '@/config/firebase/firebaseAdmin';

// Handler for PUT requests
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectToDB();
    
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
    }
    
    // Verify if user is trying to modify their own profile
    if (decodedToken.uid !== id) {
      return NextResponse.json({ success: false, message: 'Não autorizado a modificar este perfil' }, { status: 403 });
    }
    
    // Parse request body
    const requestData = await request.json();
    
    // Create update data object
    const updateData = {
      name: requestData.name,
      phone: requestData.phone
    };
    
    // Add CPF only if provided and not empty
    if (requestData.cpf) {
      updateData.cpf = requestData.cpf;
    }
    
    // Remove empty or undefined fields
    Object.keys(updateData).forEach(key => 
      (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
    );
    
    // Update responsible in database
    const responsable = await Responsable.findOneAndUpdate(
      { firebaseId: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!responsable) {
      return NextResponse.json({ success: false, message: 'Responsável não encontrado' }, { status: 404 });
    }
    
    // Return success response with updated responsible data
    return NextResponse.json({ success: true, responsable }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar responsável:', error);
    return NextResponse.json({ success: false, message: 'Erro ao atualizar responsável' }, { status: 500 });
  }
}

// Helper function to verify Firebase token
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
