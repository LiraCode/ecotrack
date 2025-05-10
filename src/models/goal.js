const { default: mongoose } = require("mongoose");
const { create, init } = require("./address");

// Goal Schema
const GoalSchema = new mongoose.Schema({
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    initialDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    points: { type: Number, required: true },
    challenges: [ {
       waste: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true },
         weight: { type:mongoose.Types.Decimal128, required: true, default: 0 },

}]
});

module.exports = mongoose.model('Goal', GoalSchema);
