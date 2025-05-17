const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

const PostSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, maxlength: 100 },
    subtitle: { type: String, required: true },
    description: { type: String, required: true, default: '', maxlength: 100 },
    category: [{ type: String, required: true }], 
    image: { type: String, required: true },
    content: { type: String, required: true, maxlength: 2000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    comments: [CommentSchema] 
});

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);