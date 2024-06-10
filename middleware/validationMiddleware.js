const { validationResult }  = require('express-validator');
const pets                  = require('../models/pets');

const handleValidationErrors = (title, view, fetchPet = false) => async (req, res, next) => {
    
    const errors = validationResult(req);
    let pet = null;

    if (fetchPet && req.params.id) {
        try {
            pet = await pets.findById(req.params.id).populate('category');
        } catch (err) {
            console.error("Error fetching pet data: ", err);
        }
    }

    if ( ! errors.isEmpty()) {
        
        return res.render(view, {
            title: title,
            errors: errors.array(),
            formData: req.body,
            pet: pet
        });
    }

    next();
};

module.exports = handleValidationErrors;
