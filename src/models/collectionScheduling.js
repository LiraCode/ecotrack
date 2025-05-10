const mongoose = require('mongoose');

const CollectionSchedulingSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    collectionPointId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectionPoint', required: true },
    date: { type: Date, required: true },
    collectedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'Aguardando confirmação do Ponto de Coleta', required: true },
    collector: { type: String, required: true,  default: 'Pendente' },
    wastes: [{
        wasteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true },
        quantity: { type: Number, required: true, default: 0 },
        weight: { type: Number, required: true, default: 0 },
    }]
});
module.exports = mongoose.model('CollectionScheduling', CollectionSchedulingSchema);
