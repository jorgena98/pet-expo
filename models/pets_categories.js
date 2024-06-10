const mongoose = require('mongoose');

const petsCategoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("petsCategories", petsCategoriesSchema);
