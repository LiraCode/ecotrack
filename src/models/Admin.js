
const mongoose = require('mongoose');

// Collaborator Schema
const AdminSchema = new mongoose.Schema({
    firebaseId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: false },
    role: { type: String, enum: ['Administrador', 'Agente'], required: true }
});


module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
// Verificar se o modelo já foi compilado para evitar erros de overwrite
