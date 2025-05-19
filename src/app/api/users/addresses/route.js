import connectToDB from '@/lib/db';
import User from '@/models/user';
import Address from '@/models/address';
import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseAdmin';

// GET - Buscar endereços de um usuário específico
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    // Obter o ID do usuário dos parâmetros da rota
    const { id } = params;
    
    // Verificar autenticação do usuário
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está acessando seus próprios endereços
    // ou se é um administrador (opcional, dependendo dos requisitos)
    if (id !== decodedToken.uid) {
      // Verificar se o usuário é um administrador
      const adminUser = await User.findOne({ firebaseId: decodedToken.uid, role: 'admin' });
      if (!adminUser) {
        return NextResponse.json(
          { error: "Acesso não autorizado" },
          { status: 403 }
        );
      }
    }
    
    // Buscar o usuário pelo ID do Firebase
    const user = await User.findOne({ firebaseId: id });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    // Buscar os endereços do usuário
    const addresses = await Address.find({ userId: user._id })
      .sort({ isDefault: -1, createdAt: -1 });
    
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Adicionar um novo endereço para o usuário
export async function POST(request, { params }) {
  try {
    await connectToDB();
    
    // Obter o ID do usuário dos parâmetros da rota
    const { id } = params;
    
    // Verificar autenticação do usuário
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está adicionando endereço para si mesmo
    // ou se é um administrador (opcional, dependendo dos requisitos)
    if (id !== decodedToken.uid) {
      // Verificar se o usuário é um administrador
      const adminUser = await User.findOne({ firebaseId: decodedToken.uid, role: 'admin' });
      if (!adminUser) {
        return NextResponse.json(
          { error: "Acesso não autorizado" },
          { status: 403 }
        );
      }
    }
    
    // Buscar o usuário pelo ID do Firebase
    const user = await User.findOne({ firebaseId: id });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    // Obter dados do corpo da requisição
    const addressData = await request.json();
    
    // Validar dados obrigatórios
    const requiredFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Se este endereço for definido como padrão, remover o padrão de outros endereços
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId: user._id, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Criar o novo endereço
    const newAddress = new Address({
      userId: user._id,
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement || '',
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      isDefault: addressData.isDefault || false
    });
    
    await newAddress.save();
    
    // Se for o primeiro endereço ou for definido como padrão, atualizar o endereço padrão do usuário
    if (addressData.isDefault || (await Address.countDocuments({ userId: user._id })) === 1) {
      await User.findByIdAndUpdate(user._id, { defaultAddressId: newAddress._id });
    }
    
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
