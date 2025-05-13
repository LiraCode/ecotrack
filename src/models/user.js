const mongoose = require('mongoose');

// Definir o esquema de usuário
const UserSchema = new mongoose.Schema({
    firebaseId: { type: String, unique: true, required: true }, // Campo obrigatório
    cpf: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user'], default: 'user' },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true }],
});

// Verificar se o modelo já foi compilado para evitar erros de overwrite
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
