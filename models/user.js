const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: { type: String, required: true },
    email: String,
    cart: {
        items: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            qty: { type: Number, required: true }
        }]
    },
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Date
    }
});

userSchema.methods.addToCart = function (product) {
    const cartItemIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });

    if (cartItemIndex >= 0) {
        this.cart.items[cartItemIndex].qty = this.cart.items[cartItemIndex].qty + 1;
    } else {
        this.cart.items.push({ productId: product._id, qty: 1 });
    }
    return this.save();
};

userSchema.methods.deleteCartItem = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });

    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);