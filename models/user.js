const getDb = require('../utils/database').getDb;
const mongodb = require('mongodb');


module.exports = class User {
    constructor(username, email, id, cart = { items: [] }) {
        this.username = username;
        this.email = email;
        this._id = id;
        this.cart = cart;
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .then(user => {
                return user;
            })
            .catch(err => {
                console.log(err);
            });
    }

    addToCart(product) {
        const db = getDb();

        const cartItemIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });

        if (cartItemIndex >= 0) {
            this.cart.items[cartItemIndex].qty = this.cart.items[cartItemIndex].qty + 1;
        } else {
            this.cart.items.push({ productId: new mongodb.ObjectId(product._id), qty: 1 });
        }

        return this.saveCart();
    }

    saveCart = () => {
        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: this.cart } })
            .then(result => {
                return result;
            })
            .catch(err => {
                console.log(err);
            });
    }

    deleteItemFromCart = (productId) => {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });

        this.cart.items = updatedCartItems;
        return this.saveCart();
    };

    clearCart = () => {
        this.cart = { items: [] };
        return this.saveCart();
    };

    getCart = () => {
        const db = getDb();
        console.log(this);

        const productIds = this.cart.items.map(item => item.productId);

        return db.collection('products').find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    const cartItem = this.cart.items.find(item => item.productId.toString() === product._id.toString());

                    return {
                        ...product,
                        qty: cartItem.qty,
                        totalPrice: product.price * cartItem.qty
                    };
                });
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    };
}