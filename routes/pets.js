const express   = require('express');
const router    = express.Router();
const multer    = require('multer');

const { body, validationResult } = require('express-validator');

const petsController        = require('../controllers/petsController');
const authMiddleware        = require('../middleware/authMiddleware');
const validationMiddleware  = require('../middleware/validationMiddleware');

// Image upload configuration
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('pet_image');

// Route to get all pets
router.get('/', authMiddleware, petsController.getAllPets);

// Route to render add pet form
router.get('/add', authMiddleware, petsController.getAddPetForm);

// Route to add a pet to the database
router.post('/add', authMiddleware, upload, petsController.validateAddUpdatePet, validationMiddleware('Add Pet', 'add_pets'), petsController.addPet);

// Route to render edit pet form
router.get('/edit/:id', authMiddleware, petsController.editPet);

// Route to update a pet in the database
router.post('/update/:id', authMiddleware, upload, petsController.validateAddUpdatePet, validationMiddleware('Edit Pet', 'edit_pets', true), petsController.updatePet);

// Route to delete a pet from the database
router.post('/delete/:id', authMiddleware, petsController.deletePet);

module.exports = router;
