import { NextResponse } from "next/server";
import Post from '@/models/post';
import "@/models/admin";
import "@/models/user";
import connectToDB from '@/lib/db';
import { auth } from '@/config/firebase/firebaseAdmin';
import mongoose from 'mongoose';

// Get a specific post
export async function GET(request, { params }) {
  try {
    // Await params to get the id
    const id = params.id;
    await connectToDB();
    
    const post = await Post.findById(id)
      .populate({
        path: 'author',
        select: '-password -__v',
      })
      .populate({
        path: 'comments.author',
        select: '-password -__v',
      });
      
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Error fetching post" }, { status: 500 });
  }
}

// Update a post
export async function PUT(request, { params }) {
  // Verify user authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: "Authentication token not provided" }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Await params to get the id
    const id = params.id;
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    // Connect to database
    await connectToDB();
    
    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Get request body
    const body = await request.json();
    const { title, subtitle, description, category, content, image } = body;
    
    // Find the admin document with the matching firebaseId
    const Admin = mongoose.model('Admin');
    const admin = await Admin.findOne({ firebaseId: firebaseUid });
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    // Update post fields
    if (title) post.title = title;
    if (subtitle) post.subtitle = subtitle;
    if (description) post.description = description;
    if (category) post.category = category;
    if (content) post.content = content;
    if (image) post.image = image;
    
    post.updatedAt = new Date();
    post.updatedBy = admin._id;
    
    await post.save();
    
    return NextResponse.json({ 
      message: "Post updated successfully", 
      post 
    });
    
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: error.message || "Error updating post" }, { status: 500 });
  }
}

// Delete a post
export async function DELETE(request, { params }) {
  // Verify user authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: "Authentication token not provided" }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Await params to get the id
    const id = params.id;
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid; // Define firebaseUid here
    
    // Connect to database
    await connectToDB();
    
    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Soft delete - change status to inactive
    post.status = 'inactive';
    post.updatedAt = new Date();
    
    // Find the admin document with the matching firebaseId
    const Admin = mongoose.model('Admin');
    const admin = await Admin.findOne({ firebaseId: firebaseUid });
    
    if (admin) {
      post.updatedBy = admin._id;
    }
    
    await post.save();
    
    return NextResponse.json({ 
      message: "Post deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: error.message || "Error deleting post" }, { status: 500 });
  }
}
