const fs = require('fs');
const path = require('path');

const rootDir = require('../utils/path');
const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {

    static addProduct(product) {

        // Read cart from file
        readCartFromFile((products) => {
            // Check if product already exists in cart
            const existingProductIndex = products.findIndex(p => p.id === product.id);
            const existingProduct = products[existingProductIndex];

            if (existingProduct) {
                existingProduct.qty += 1;
                products[existingProductIndex] = existingProduct;
            } else {
                product.qty = 1;
                products.push(product);
            }

            // Write cart to file
            writeCartToFile(products);

            // Calculate total price
            console.log(calcTotalPrice(products));

        });
    }

    static deleteProduct(productId) {
        readCartFromFile((products) => {
            const updatedProducts = products.filter(p => p.id !== productId);
            writeCartToFile(updatedProducts);
        });
    }

    static getCart(callback) {
        readCartFromFile((products) => {
            callback(calcTotalPrice(products), products);
        });
    }
}

const readCartFromFile = (callback) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            callback([]);
        } else {
            callback(JSON.parse(fileContent));
        }
    })
}

const writeCartToFile = (products) => {
    fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
    })
}

const calcTotalPrice = (products) => {
    return products.reduce((total, product) => {
        return total + +product.price * product.qty;
    }, 0);
}