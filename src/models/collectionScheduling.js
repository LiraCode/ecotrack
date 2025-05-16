const mongoose = require('mongoose');

const CollectionSchedulingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collectionPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectionPoint', required: true },
    date: { type: Date, required: true },
    collectedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'Aguardando confirmação do Ponto de Coleta', required: true },
    collector: { type: String, required: true,  default: 'Pendente' },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    wastes: [{
        wasteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true },
        quantity: { type: Number, required: true, default: 0 },
        weight: { type: Number, required: true, default: 0 },
    }]
});
module.exports = mongoose.models.CollectionScheduling || mongoose.model("CollectionScheduling", CollectionSchedulingSchema);