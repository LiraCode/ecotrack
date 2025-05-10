const mongoose = require('mongoose');
const { create } = require('./address');
const { updateCurrentUser } = require('firebase/auth');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    }]

});