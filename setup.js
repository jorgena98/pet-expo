require('dotenv').config();

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const accounts  = require('./models/accounts');

// db connection
mongoose.connect(process.env.DB_URI);

// Create admin account

async function createAdmin() {
    
    try {
        
        const admin = await accounts.findOne({ username: 'admin' });

        // If admin account doesn't exist, create it
        if ( ! admin) {
            
            await accounts.create({
                username: 'admin',
                password: 'Admin123*'
            });

            console.log('Admin account created successfully.');

        } else {

            console.log('Admin account already exists.');
        }
        
    } catch (error) {

        console.error('Error creating admin account:', error);

    } finally {

        mongoose.disconnect();
    }
}

createAdmin();
