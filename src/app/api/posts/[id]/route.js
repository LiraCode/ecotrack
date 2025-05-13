import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/post';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

// Obter post por ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de post inválido'
      }, { status: 400 });
    }
    
    // Buscar post
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('updatedBy', 'name email')
      .populate('comments.author', 'name email');
    
    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post não encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: post
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar post',
      details: error.message
    }, { status: 500 });
  }
}

// Atualizar post
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updateData = await request.json();
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de post inválido'
      }, { status: 400 });
    }
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token de autenticação não fornecido'
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar token do Firebase
      const decodedToken = await auth.verifyIdToken(token);
      
      // Verificar se o post existe
      const post = await Post.findById(id);
      if (!post) {
        return NextResponse.json({
          success: false,
          error: 'Post não encontrado'
        }, { status: 404 });
      }
      
      // Verificar permissões (apenas o autor ou admin pode editar)
      // Aqui você pode adicionar lógica para verificar permissões
      const userMongo = await User.findOne({ uid: decodedToken.uid });
      if (!userMongo.role === 'admin' || !userMongo.role === 'collaborator'){
        return NextResponse.json({
          success: false,
          error: 'Você não tem permissão para editar este post'
        }, { status: 403 });
      } 
        updateData.updatedBy = userMongo._id; // ID do usuário que está atualizando o post
      
      // Atualizar post
      updateData.updatedAt = new Date();
      
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      )
      .populate('author', 'name email')
      .populate('updatedBy', 'name email')
      .populate('comments.author', 'name email');
      
      return NextResponse.json({
        success: true,
        data: updatedPost
      }, { status: 200 });
    } catch (authError) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json({
        success: false,
        error: 'Token de autenticação inválido'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar post',
      details: error.message
    }, { status: 500 });
  }
}

// Excluir post (soft delete - apenas muda o status para 'inactive')
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de post inválido'
      }, { status: 400 });
    }
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token de autenticação não fornecido'
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const user = await auth.getUser(decodedToken.uid);
    
    try {
      // Verificar token do Firebase
      const decodedToken = await auth.verifyIdToken(token);
      
      // Verificar se o post existe
      const post = await Post.findById(id);
      if (!post) {
        return NextResponse.json({
          success: false,
          error: 'Post não encontrado'
        }, { status: 404 });
      }
      
      // Verificar permissões (apenas o autor ou admin pode excluir)
      // Aqui você pode adicionar lógica para verificar permissões
      if (!user.role === 'admin' || !user.role === 'collaborator'){
        return NextResponse.json({
          success: false,
          error: 'Você não tem permissão para excluir este post'
        }, { status: 403 });
      }
      // bucar usuário mongodb pelo uid do firebase
      const userMongo = await User.findOne({ uid: decodedToken.uid });
      if (!userMongo) {
        return NextResponse.json({
          success: false,
          error: 'Usuário não encontrado'
        }, { status: 404 });
      }


      
      // Soft delete - atualizar status para 'inactive'
      const deletedPost = await Post.findByIdAndUpdate(
        id,
        { $set: { status: 'inactive', updatedAt: new Date() } },
        { new: true }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Post excluído com sucesso'
      }, { status: 200 });
    } catch (authError) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json({
        success: false,
        error: 'Token de autenticação inválido'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao excluir post',
      details: error.message
    }, { status: 500 });
  }
}