const mongoose = require('mongoose');
import AddressSchema from './address';


// Collection Point Schema
const CollectionPointSchema = new mongoose.Schema({
    cnpj: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Responsible', required: true },
    typeOfWasteId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true }],
});

// Export the model
module.exports = mongoose.model('CollectionPoint', CollectionPointSchema);

