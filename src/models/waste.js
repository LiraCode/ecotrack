const mongoose = require('mongoose');

// Waste Schema
const WasteSchema = new mongoose.Schema({
    type: { type: String, unique:true, required: true },
    description: { type: String }
});
module.exports = mongoose.models.Waste || mongoose.model('Waste', WasteSchema);