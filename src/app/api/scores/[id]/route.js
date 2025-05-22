import connectToDB from '@/lib/db';
import Score from '@/models/score';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

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

// Helper function to check if ID is valid
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// DELETE - Remove a specific score
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    console.log('Received ID:', id);
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verify authentication with Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Find the user to verify permissions
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Find the score
    const score = await Score.findById(id);
    if (!score) {
      console.log("Score not found");
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Check if the user is the owner of the score or an admin
    if (score.clientId && user._id && 
        score.clientId.toString() !== user._id.toString() && 
        user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    // Remove the score
    await Score.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Score removido com sucesso' 
    });
  } catch (error) {
    console.error('Error deleting score:', error);
    return NextResponse.json(
      { message: 'Erro ao remover score', error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get a specific score (optional, but useful)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    await connectToDB();
    
    // Verify authentication with Firebase
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    
    // Find the user to verify permissions
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Find the score with populated goal data
    const score = await Score.findById(id).populate('goalId');
    if (!score) {
      return NextResponse.json({ message: 'Score não encontrado' }, { status: 404 });
    }
    
    // Check if the user is the owner of the score or an admin
    if (score.clientId && user._id && 
        score.clientId.toString() !== user._id.toString() && 
        user.role !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }
    
    return NextResponse.json({ score });
  } catch (error) {
    console.error('Error fetching score:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar score', error: error.message },
      { status: 500 }
    );
  }
}