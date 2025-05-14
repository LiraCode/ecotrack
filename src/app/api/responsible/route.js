import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Responsible from '@/models/responsable';

export async function POST(request) {
  try {
    console.log("Iniciando processamento da requisição POST /api/responsible");
    
    // Conectar ao MongoDB
    await connectDB();
    console.log("Conexão com MongoDB estabelecida");
    
    // Obter dados da requisição
    const responsibleData = await request.json();
    console.log("Dados recebidos:", JSON.stringify(responsibleData));
    console.log("dados recebidos:", responsibleData);
    
    // Validar dados básicos
    if (!responsibleData.name || !responsibleData.email || !responsibleData.cpf || !responsibleData.phone || !responsibleData.firebaseId) {
      console.error("Dados obrigatórios ausentes");
      return NextResponse.json(
        { error: 'Nome, email, CPF, telefone e firebaseId são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Criar novo responsável no MongoDB
    try {
      console.log("Tentando criar responsável no MongoDB");
      const newResponsible = new Responsible({
        firebaseId: responsibleData.firebaseId,
        cpf: responsibleData.cpf,
        name: responsibleData.name,
        email: responsibleData.email,
        phone: responsibleData.phone
      });
      
      await newResponsible.save();
      console.log("Responsável salvo com sucesso:", newResponsible._id);
      
      return NextResponse.json(
        { success: true, responsible: newResponsible },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Erro ao salvar responsável:", saveError);
      
      // Verificar se é um erro de duplicação
      if (saveError.code === 11000) {
        return NextResponse.json(
          { error: 'Email, CPF ou firebaseId já cadastrado' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao criar responsável', details: saveError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro não tratado:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Obter o CPF, email ou firebaseId da query string para busca específica
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');
    const email = searchParams.get('email');
    const firebaseId = searchParams.get('uid');
    
    if (cpf || email || firebaseId) {
      // Criar filtro de busca
      const filter = {};
      if (cpf) filter.cpf = cpf;
      if (email) filter.email = email;
      if (firebaseId) filter.firebaseId = firebaseId;
      
      // Buscar responsável pelo filtro
      const responsible = await Responsible.findOne(filter);
      
      if (!responsible) {
        return NextResponse.json(
          { error: 'Responsável não encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: true, responsible },
        { status: 200 }
      );
    } else {
      // Buscar todos os responsáveis
      const responsibles = await Responsible.find();
      
      return NextResponse.json(
        { success: true, responsibles },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Erro ao buscar responsável(eis):', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar responsável(eis)', details: error.message },
      { status: 500 }
    );
  }
}