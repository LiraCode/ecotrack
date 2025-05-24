const mongoose = require('mongoose');

// Define o esquema de geolocalização
const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    }
});

// Collection Point Schema
const CollectionPointSchema = new mongoose.Schema({
    cnpj: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    responsableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Responsable', required: true },
    typeOfWasteId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true }],
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    isActive: { type: Boolean, default: true ,required: true },
    isDeleted: { type: Boolean, default: false ,required: true },
    // Adicionando campos de latitude e longitude diretamente
    lat: { type: Number },
    lng: { type: Number },
    // Adicionando campo de localização para consultas geoespaciais
    location: {
        type: PointSchema,
        index: '2dsphere' // Índice para consultas geoespaciais
  
    }
}, {
    timestamps: true
});

// Middleware para atualizar o campo location antes de salvar
CollectionPointSchema.pre('save', function(next) {
    if (this.lat && this.lng) {
        this.location = {
            type: 'Point',
            coordinates: [this.lng, this.lat] // [longitude, latitude]
        };
    }
    next();
});

// Export the model
module.exports = mongoose.models.CollectionPoint || mongoose.model('CollectionPoint', CollectionPointSchema);