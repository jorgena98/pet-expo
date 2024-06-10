const mongoose          = require ('mongoose');
const petsCategories    = require('./pets_categories');

const petsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    
    origin: {
        type: String,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'petsCategories'
    },

    image: {
        type: String,
        required: true
    },

    created: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model("Pets", petsSchema);