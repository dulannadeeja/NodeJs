const Product = require('../models/product');

module.exports.getProducts = (req, res) => {
    Product.findAll()
        .then((products) => {
            res.render('admin/products', {
                title: 'All Products',
                path: '/admin/products',
                products: products
            });
        })
        .catch(err => {
            console.log(err);
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
    const product = new Product(req.body.title, req.body.imageUrl, req.body.description, req.body.price, req.user._id, null);
    product.save()
        .then(() => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render('admin/edit-product', {
                title: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                product: product
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;

    const product = new Product(req.body.title, req.body.imageUrl, req.body.description, req.body.price, req.body.userId, productId);

    product.editById(productId)
        .then(() => {
            console.log('Updated Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    Product.deleteById(productId)
        .then(() => {
            console.log('Deleted Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
};