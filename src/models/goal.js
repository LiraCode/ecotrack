const { default: mongoose } = require("mongoose");

// Goal Schema
const GoalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    initialDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
    targetType: { type: String, enum: ['weight', 'quantity'], required: true },
    targetValue: { type: Number, required: true },
    points: { type: Number, required: true },
    challenges: [{
        waste: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true },
        weight: { type: mongoose.Types.Decimal128, required: false },
        quantity: { type: Number, required: false }
    }]
});

module.exports = mongoose.model('Goal', GoalSchema);
