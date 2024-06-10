const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');

const accountsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Hash the password before saving
accountsSchema.pre('save', async function(next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
accountsSchema.methods.comparePassword = async function(accountPassword) {
    return bcrypt.compare(accountPassword, this.password);
};

module.exports = mongoose.model('accounts', accountsSchema);
