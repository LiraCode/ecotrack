const mongoose = require('mongoose');

const ResponsibleSchema = new mongoose.Schema({
    cpf: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    
});

module.exports = mongoose.model('Responsible', ResponsibleSchema);
