const mongoose = require('mongoose');

const ResponsibleSchema = new mongoose.Schema({
    firebaseId: { type: String, unique: true, required: true },
    cpf: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['Responsável'], required: true, default: 'Responsável' },
    
});

module.exports = mongoose.models.Responsible || mongoose.model('Responsible', ResponsibleSchema);
