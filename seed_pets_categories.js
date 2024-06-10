require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./models/pets_categories');

// db connection
mongoose.connect(process.env.DB_URI)
    
    .then(() => {

        const categories = ['Dogs', 'Cats', 'Birds'];

        // Insert categories
        Category.insertMany(categories.map(name => ({ name })))
            .then(() => {
                console.log('Categories inserted successfully');
                mongoose.connection.close(); 
            })
            .catch(error => {
                console.error('Error inserting categories:', error);
                mongoose.connection.close();
            });
    })
    
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });
