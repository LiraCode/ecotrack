const mongoose = require('mongoose');

// Definir o esquema de usuário
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true }, // Campo obrigatório
    cpf: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    type: { type: String, enum: ['user', 'collaborator', 'admin'], default: 'user' }
});

// Verificar se o modelo já foi compilado para evitar erros de overwrite
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
