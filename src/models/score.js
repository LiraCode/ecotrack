const mongoose = require('mongoose');

// Score Schema
const ScoreSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['active', 'inactive', 'expired', 'completed'], 
        default: 'active' 
    },
    currentValue: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware para atualizar o campo updatedAt antes de salvar
ScoreSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Score Model
module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);