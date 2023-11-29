const Product = require('../models/product');

module.exports.getProducts = (req, res) => {
    // Product.findAll()
    req.user.getProducts()
        .then(
            (products) => {
                res.render('admin/products', {
                    title: 'Products',
                    path: '/admin/products',
                    products: products
                });
            }
        ).catch(err => {
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
    req.user.createProduct({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        price: req.body.price
    }
    ).then(result => {
        console.log('Created Product');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
}

module.exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    // Product.findByPk(productId)
    req.user.getProducts({ where: { id: productId } })
        .then(product => {
            res.render('admin/edit-product', {
                title: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                product: product[0]
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByPk(productId)
        .then(product => {
            product.title = req.body.title;
            product.imageUrl = req.body.imageUrl;
            product.description = req.body.description;
            product.price = req.body.price;
            return product.save();
        })
        .then(result => {
            console.log('Updated Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.destroy({
        where: {
            id: productId
        }
    }).then(result => {
        console.log('Deleted Product');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });

};