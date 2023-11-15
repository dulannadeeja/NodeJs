const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    products: [{
        product: { type: Object, required: true },
        qty: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    user: {
        username: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    deliveryStatus: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Order', Schema);