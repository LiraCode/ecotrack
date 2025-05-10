const mongoose = require('mongoose');

// Waste Schema
const WasteSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String }
});