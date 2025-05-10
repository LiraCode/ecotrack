const mongoose = require('mongoose');

// Collaborator Schema
const CollaboratorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: false },
    role: { type: String, enum: ['Administrator', 'Employee'], required: true }
});


module.exports = mongoose.model('Collaborator', CollaboratorSchema);
