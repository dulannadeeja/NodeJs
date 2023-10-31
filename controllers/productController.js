const Product = require('../models/product');


module.exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        title: 'Add Product',
        path: '/admin/add-product'
    });
}

module.exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/admin/add-product');
}

module.exports.getProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render('shop', {
            title: 'Shop',
            path: '/',
            products: products
        });
    });
}

