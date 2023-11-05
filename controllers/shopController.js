const Product = require('../models/product');
const Cart = require('../models/cart');

module.exports.getProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            title: 'All Products',
            path: '/all-products',
            products: products
        });
    });
}

module.exports.getProductView = (req, res) => {
    const productId = req.params.productId;
    Product.fetchAll((products) => {
        const product = products.find(p => p.id === productId);
        res.render('shop/product-view', {
            title: 'Product Detail',
            path: '/all-products',
            product: product
        });
    });
}

module.exports.getShop = (req, res) => {
    res.render('shop/index', {
        title: 'Shop',
        path: '/'
    });
}

module.exports.getCart = (req, res) => {
    Cart.getCart((totalPrice, products) => {
        res.render('shop/cart', {
            title: 'Cart',
            path: '/cart',
            products: products,
            totalPrice: totalPrice
        });
    });
}

module.exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout'
    });
}

module.exports.getOrders = (req, res) => {
    res.render('shop/orders', {
        title: 'Orders',
        path: '/orders'
    });
}

module.exports.addToCart = (req, res) => {
    const productId = req.body.productId;
    Product.fetchAll((products) => {
        const product = products.find(p => p.id === productId);
        Cart.addProduct(product);
        res.redirect('/cart');
    });
}

module.exports.postCratDeleteItem = (req, res) => {
    const productId = req.body.productId;
    Cart.deleteProduct(productId);
    res.redirect('/cart');
};

