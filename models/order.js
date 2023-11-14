const getDb = require('../utils/database').getDb;
const mongodb = require('mongodb');

module.exports = class Order {
    constructor(id, products, userId, date, total, status, address) {
        this._id = id;
        this.products = products;
        this.userId = userId;
        this.date = date;
        this.total = total;
        this.status = status;
        this.address = address;
    }

    save() {
        const db = getDb();
        return db.collection('orders')
            .insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findAllOrdersOfUser = (userId) => {
        const db = getDb();

        return db.collection('orders').find({ userId: new mongodb.ObjectId(userId) }).toArray()
            .then(orders => {
                return orders;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findById = (orderId) => {
        const db = getDb();

        return db.collection('orders').find({ _id: new mongodb.ObjectId(orderId) }).next()
            .then(order => {
                return order;
            })
            .catch(err => {
                console.log(err);
            });
    }

    addToOrders = () => {
        const db = getDb();

        return db.collection('orders').insertOne(this)
            .then(result => {
                return result;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static getOrders = () => {
        const db = getDb();

        return db.collection('orders').find().toArray()
            .then(orders => {
                return orders;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static deleteById = (orderId) => {
        const db = getDb();

        return db.collection('orders').deleteOne({ _id: new mongodb.ObjectId(orderId) })
            .then(result => {
                return result;
            })
            .catch(err => {
                console.log(err);
            });
    }
}