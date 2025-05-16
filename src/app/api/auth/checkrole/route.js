import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import User from '@/models/user';
import Responsable from '@/models/responsable';''
import Admin from '@/models/admin';
import { auth } from '@/config/firebase/firebaseAdmin';

export async function GET(request) {
  try {
    console.log("checkrole");

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

    const uid = decodedToken.uid;

    // Conectar ao MongoDB
    await connectToDB();
    console.log("Conexão com MongoDB estabelecida");

    // Buscar usuário em cada collection
    let role = "Uknown"; // Papel padrão

    // buscar o usuário em cada collection
    const adminUser = await Admin.findOne({ firebaseId: uid });
    const responsablelUser = await Responsable.findOne({ firebaseId: uid });
    const regularUser = await User.findOne({ firebaseId: uid });

    if (regularUser) {
      role = "User";
      return NextResponse.json({ role }, { status: 200 });
    } else if (adminUser) {
      role = adminUser.role;
      return NextResponse.json({ role }, { status: 200 });
    } else if (responsablelUser) {
      role = responsablelUser.role;
      return NextResponse.json({ role }, { status: 200 });
    }

    // Se não encontrou em nenhuma collection
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro ao verificar regra do usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro ao verificar regra do usuário', details: error.message },
      { status: 500 }
    );
  }
}