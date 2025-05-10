const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

// Verificar se o modelo já foi compilado para evitar erros de overwrite
const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);

module.exports = Address;