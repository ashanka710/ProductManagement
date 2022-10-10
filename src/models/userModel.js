const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        require: true,
        trim: true
    },
    lname: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    profileImage: {
        type: String,
        require: true,
        trim: true
    },
    phone: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        minLen: 8,
        maxLen: 15,
        trim: true
    },
    address: {
        shipping: {
            street: {
                type: String,
                require: true,
                trim: true
            },
            city: {
                type: String,
                require: true,
                trim: true
            },
            pincode: {
                type: Number,
                require: true
            }
        },
        billing: {
            street: {
                type: String,
                require: true,
                trim: true
            },
            city: {
                type: String,
                require: true,
                trim: true
            },
            pincode: {
                type: Number,
                require: true
            }
        }
    }
}, { timestamp: true });


module.exports = mongoose.model('userList', userSchema)