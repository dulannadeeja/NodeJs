const Product = require('../models/product');

module.exports.getProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render('admin/products', {
            title: 'Products',
            path: '/admin/products',
            products: products
        });
    });
}

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        title: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
}

module.exports.postAddProduct = (req, res, next) => {
    const product = new Product(null, req.body.title, req.body.imageUrl, req.body.description, req.body.price);
    product.save();
    res.redirect('/admin/add-product');
}

module.exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.fetchAll((products) => {
        const product = products.find(p => p.id === productId);
        res.render('admin/edit-product', {
            title: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: product
        });
    });
}

module.exports.postEditProduct = (req, res, next) => {
    const product = new Product(req.body.productId, req.body.title, req.body.imageUrl, req.body.description, req.body.price, req.body.id);
    product.save();
    res.redirect('/admin/products');
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId);
    res.redirect('/admin/products');
};