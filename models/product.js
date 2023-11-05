const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');
const p = path.join(rootDir, 'data', 'products.json');
const Cart = require('./cart');

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.title = title;
        this.id = id;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                console.log('this.id: ', this.id);
                const existingProductIndex = products.findIndex(p => p.id === this.id);
                products[existingProductIndex] = this;
            } else {
                console.log('this.id: ', this.id);
                this.id = Math.random().toString();
                products.push(this);
            }
            fs.writeFile(p, JSON.stringify(products), (err) => {
                if (err) console.log(err);
            });
        });
    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const updatedProducts = products.filter(p => p.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                if (err) console.log(err);
                Cart.deleteProduct(id);
            });
        });
    }

    static fetchAll(callback) {
        getProductsFromFile(callback);
    }

    static findById(id, callback) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            callback(product);
        });
    }
};

function getProductsFromFile(callback) {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            callback([]);
        } else {
            if (fileContent.length === 0) {
                callback([]);
                return;
            }
            callback(JSON.parse(fileContent));
        }
    });
};