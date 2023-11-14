const mongodb = require('mongodb');
const getDb = require('../utils/database').getDb;

module.exports = class Product {
    constructor(title, imageUrl, description, price, userId, id) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.userId = new mongodb.ObjectId(userId);
        this._id = new mongodb.ObjectId(id);
    }

    save() {
        const db = getDb();
        return db.collection('products')
            .insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products')
            .find({ _id: new mongodb.ObjectId(productId) })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => {
                console.log(err);
            });
    }

    editById(productId) {
        const db = getDb();
        return db.collection('products')
            .updateOne({ _id: new mongodb.ObjectId(productId) }, { $set: this })
            .then(product => {
                return product;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static deleteById(productId) {
        const db = getDb();
        return db.collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(productId) })
            .then(product => {
                return product;
            })
            .catch(err => {
                console.log(err);
            });
    }
}