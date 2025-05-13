import { NextResponse } from "next/server";
import Post from '@/models/post';
import User from '@/models/user';
import connectToDB from '@/lib/db';
import { auth } from '@/config/firebase/firebaseAdmin';



export async function GET() {
    try {
        await connectToDB();

        // Buscar posts com populate para incluir autor e ordenar por data de criação
        const posts = await Post.find({ status: 'active' })
            .populate({
                path: 'author',
                select: '-password -__v', // Excluir campos sensíveis
                match: { status: 'active' }
            })
            .populate({
                path: 'comments.author',
                select: '-password -__v', // Excluir campos sensíveis
                match: { status: 'active' }
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 });
    }
}

export async function POST(request) {
    // Verificar se o usuário está autenticado
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    var user = null;
    try {
        // Verificar token do Firebase
        const decodedToken = await auth.verifyIdToken(token);
        const key  = decodedToken.uid;
        console.log("Token decodificado:", key);

        // Verificar se o usuário existe no banco de dados
        await connectToDB();
         user = await User.findOne({ firebaseId: key });
        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    const userId = user._id;
    const role = user.type;
    // Verificar se o usuário tem permissão para criar posts    
    if (role !=='admin') {
        console.error("Usuário não autorizado:", user.type);
        return NextResponse.json({ error: "Você não tem permissão para criar posts" }, { status: 403 });
    }

    try {
        await connectToDB();
        const body = await request.json();
        body.author = userId; // ID do autor
        body.updatedBy = userId; // ID do usuário que atualizou o post

        // Extrair campos conforme definido no modelo
        const {
            title,
            subtitle,
            description,
            category,
            image,
            content,
            author,
            updatedBy
        } = body;

        // Validar campos obrigatórios conforme o modelo
        if (!title || !subtitle || !description || !category || !image || !content || !author || !updatedBy) {
            return NextResponse.json(
                { error: "Campos obrigatórios ausentes" },
                { status: 400 }
            );
        }

        // Validar comprimentos máximos conforme o modelo
        if (title.length > 100) {
            return NextResponse.json(
                { error: "O título não pode exceder 100 caracteres" },
                { status: 400 }
            );
        }

        if (description.length > 100) {
            return NextResponse.json(
                { error: "A descrição não pode exceder 100 caracteres" },
                { status: 400 }
            );
        }

        if (content.length > 2000) {
            return NextResponse.json(
                { error: "O conteúdo não pode exceder 2000 caracteres" },
                { status: 400 }
            );
        }

        // Criar o post usando o modelo
        const post = new Post({
            title,
            subtitle,
            description,
            category: Array.isArray(category) ? category : [category],
            image,
            content,
            author,
            updatedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            comments: []
        });

        await post.save();

        // Buscar o post recém-criado com as referências populadas
        const newPost = await Post.findById(post._id)
            .populate({
                path: 'author',
                select: '-password -__v'
            })
            .populate({
                path: 'updatedBy',
                select: '-password -__v'
            });

        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Erro ao criar post:", error);
        return NextResponse.json(
            { error: "Erro ao criar post" },
            { status: 500 }
        );
    }
}