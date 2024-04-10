const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    email: 
    {
        type: String,
        required: true,
        unique: true
    },

    password:
    {
        type: String,
        required: String
    }

})


const loginUser = mongoose.model('loginUser', loginSchema);

module.exports = loginUser;