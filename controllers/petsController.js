const { body }              = require('express-validator');
const pets                  = require('../models/pets');
const petsCategories        = require('../models/pets_categories');
const fs                    = require('fs');
const mongoose              = require('mongoose');
const { validationResult }  = require('express-validator');

// Get all pets
exports.getAllPets = async (req, res) => {
   
    try {
        const petsList = await pets.find().populate('category').exec();

        res.render('pets', {
            title: 'Pets panel',
            pets: petsList,
            formData: {}
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger'});
    }
};


// Get form to add a pet
exports.getAddPetForm = async (req, res) => {
    
    try {
        
        const categories = await petsCategories.find();
        
        res.render('add_pets', {
            title: 'Add Pet',
            categories: categories,
            errors: [],
            formData: {}
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
};

// Validation rules for adding a pet
exports.validateAddUpdatePet = [
    
    body('pet_name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
        .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only alphabetic characters and spaces'),
  
    body('pet_origin')
        .trim()
        .notEmpty().withMessage('Origin is required')
        .isLength({ min: 2 }).withMessage('Origin must be at least 2 characters')
        .matches(/^[A-Za-z\s]+$/).withMessage('Origin must contain only alphabetic characters and spaces'),

    body('pet_category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isAlphanumeric().withMessage('Category is invalid')
];

// Add a pet
exports.addPet = async (req, res) => {
    
    try {

        // Check for validation errors
        const errors = validationResult(req);

        if ( ! errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const pet = new pets({
            name: req.body.pet_name,
            origin: req.body.pet_origin,
            category: req.body.pet_category,
            image: req.file.filename
        });

        await pet.save();

        req.session.message = {
            message: 'Pet added successfully',
            type: 'success'
        };
        res.redirect('/pets');
    } catch (err) {
        console.log(err);
        res.json({ message: err.message, type: 'danger' });
    }
};


// Get form to edit a pet
exports.editPet = async (req, res) => {
    
    try {
        
        const id    = req.params.id;
        const pet   = await pets.findById(id).populate('category').exec();

        if (pet == null) {
            return res.redirect('/pets');
        }
        
        const categories = await petsCategories.find();

        res.render('edit_pets', {
            title: 'Edit Pet',
            pet: pet,
            categories: categories,
            errors: [],
            formData: {}
        });
    } catch (err) {
        res.redirect('/pets');
    }
};

// Update a pet
exports.updatePet = async (req, res) => {
    
    try {
        
        const id = req.params.id;
        if ( ! mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id parameter', type: 'danger' });
        }
        
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        await pets.findByIdAndUpdate(id, {
            name: req.body.pet_name,
            origin: req.body.pet_origin,
            category: req.body.pet_category,
            image: new_image
        });

        req.session.message = {
            message: "Update successful",
            type: "success"
        };

        res.redirect('/pets');

    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
};

// Delete a pet
exports.deletePet = async (req, res) => {
    
    const id = req.params.id;
    
    try {
        
        const result = await pets.findByIdAndDelete(id).exec();
        
        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'success',
            message: 'Pet deleted successfully'
        };
        
        res.redirect('/pets');
    } catch (err) {
        res.json({ message: err.message });
    }
};
