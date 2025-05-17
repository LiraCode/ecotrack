import { NextResponse } from "next/server";
import Post from '@/models/post';
import "@/models/admin"; // Import Admin model to ensure it's registered
import "@/models/user";
import connectToDB from '@/lib/db';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectToDB();

        // Fetch posts with populated author and sort by creation date
        const posts = await Post.find({ status: 'active' })
            .populate({
                path: 'author',
                select: '-password -__v', // Exclude sensitive fields
                match: { status: 'active' }
            })
            .populate({
                path: 'comments.author',
                select: '-password -__v', // Exclude sensitive fields
                match: { status: 'active' }
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: "Error fetching posts" }, { status: 500 });
    }
}

export async function POST(request) {
    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "Authentication token not provided" }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verify Firebase token
        const decodedToken = await auth.verifyIdToken(token);
        const firebaseUid = decodedToken.uid;
        
        // Connect to database
        await connectToDB();
        
        // Get request body
        const body = await request.json();
        const { title, subtitle, description, category, content, image } = body;
        
        // Validate required fields
        if (!title || !content || !image) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        // Generate slug from title if not provided
        const slug = body.slug || title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        
        // Find the admin document with the matching firebaseId
        const Admin = mongoose.model('Admin');
        const admin = await Admin.findOne({ firebaseId: firebaseUid });
        
        if (!admin) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }
        
        // Create new post
        const newPost = new Post({
            title,
            subtitle: subtitle || title,
            description: description || title.substring(0, 100),
            category: category || ['Outro'],
            image,
            content,
            slug,
            author: admin._id, // Use the MongoDB ObjectId of the admin
            status: 'active'
        });
        
        await newPost.save();
        
        return NextResponse.json({ 
            message: "Post created successfully", 
            post: newPost 
        }, { status: 201 });
        
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ error: error.message || "Error creating post" }, { status: 500 });
    }
}