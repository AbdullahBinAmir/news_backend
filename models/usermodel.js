const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    verified: { 
        type: Boolean, 
        default: false 
    },
    token: String,
    resetPasswordCode:String,
    resetPasswordToken: { type: String },
    resetPasswordCodeExpires: { type: Date }
})

module.exports = mongoose.model('UserData', dataSchema)