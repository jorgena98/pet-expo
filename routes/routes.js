const express   = require('express');
const router    = express.Router();

const mongoose          = require('mongoose');
const accounts          = require('../models/accounts');
const pets              = require('../models/pets');
const petsCategories    = require('../models/pets_categories');

const { body, validationResult } = require('express-validator');

// home page
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Query pets collection with pagination
        const petsList = await pets.find().populate('category').skip(skip).limit(limit).exec();

        const totalCount = await pets.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        res.render('index', {
            title: 'Pet list',
            pets: petsList,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            formData: {}
        });

    } catch (err) {
        res.render('error', {
            title: 'Error',
            message: 'Try again later'
        });
    }
});

router.post('/',
    [
        body('name')
            .optional({ checkFalsy: true })
            .matches(/^[A-Za-z\s]+$/)
            .withMessage('Name must contain only alphabetic characters and spaces'),

        body('category')
            .optional({ checkFalsy: true })
            .custom(value => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Category must be a valid ID');
                }
                return true;
            })
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            
            const searchQuery = {};

            if (req.body.name) {
                searchQuery.name = new RegExp(req.body.name, 'i');
            }

            if (req.body.category && mongoose.Types.ObjectId.isValid(req.body.category)) {
                searchQuery.category = new mongoose.Types.ObjectId(req.body.category);
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const petsList = await pets.find(searchQuery).populate('category').skip(skip).limit(limit).exec();

            const totalCount = await pets.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / limit);

            res.render('index', {
                title: 'Pet list',
                pets: petsList,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                formData: req.body
            });

        } catch (err) {
            res.json({ message: err.message, type: 'danger' });
        }
    }
);

// Get pets by category page
router.get('/pets/category/:categoryName', async (req, res) => {
    try {
        const categoryName  = req.params.categoryName;
        const category      = await petsCategories.findOne({ name: categoryName }); 

        if ( ! category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const categoryPets = await pets.find({ category: category._id });
        res.render('category_pets_list', { pets: categoryPets, title: categoryName, formData: {} });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/login', (req, res) => {
    
    req.session.message = ''; 
    
    res.render('login', {
        title: 'Login page',
        username: req.session.username || '',
        usernameField: typeof usernameField !== 'undefined' ? usernameField : '',
        formData: {}
    });
});


router.post('/login', 
    
    body('username').isAlphanumeric().withMessage('Invalid username format'),
    
    async (req, res) => {
    
    const { username, password } = req.body;

    // Check for validation errors
    const errors = validationResult(req);

    if ( ! errors.isEmpty()) {
        req.session.usernameField = errors.array()[0].msg;
        req.session.username = username || '';
        return res.redirect('/login');
    }

    try {
        const account = await accounts.findOne({ username });

        if ( ! account || password === '') {
            req.session.message = 'Invalid username or password';
            req.session.username = username || '';
            return res.redirect('/login');
        }

        const passwordMatch = await account.comparePassword(password);

        if ( ! passwordMatch) {
            req.session.message = 'Invalid username or password';
            req.session.username = username || '';
            return res.redirect('/login');
        }

        req.session.accountId = account._id;
        res.redirect('/pets');
        
    } catch (error) {

        console.error('Error:', error);
        req.session.message = 'An unexpected error occurred';
        return res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
