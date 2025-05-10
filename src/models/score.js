const mongoose = require('mongoose');

// Score Schema
const ScoreSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    status: { type: String, required: true, enum: ['active', 'inactive', 'expired','completed'], default: 'active' },
    expirationDate: { type: Date, required: true }
});