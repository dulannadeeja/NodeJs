const Product = require('../models/product');

module.exports.getProducts = (req, res) => {
    Product.find({ userId: req.user._id })
        .then((products) => {
            res.render('admin/products', {
                title: 'All Products',
                path: '/admin/products',
                products: products,
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
        editing: false,
    });
}

module.exports.postAddProduct = (req, res, next) => {
    const product = new Product({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        price: req.body.price,
        userId: req.user
    });
    product.save()
        .then((result) => {
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
            if (!product) {
                req.flash('error', 'Product Not Found');
                return res.redirect('/admin/products');
            }

            if (product.userId.toString() !== req.user._id.toString()) {
                req.flash('error', 'Unauthorized Access');
                return res.redirect('/admin/products');
            }

            res.render('admin/edit-product', {
                title: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                product: product,
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {

            if (product.userId.toString() !== req.user._id.toString()) {
                req.flash('error', 'Unauthorized Access');
                return res.redirect('/admin/products');
            }

            product.title = req.body.title;
            product.imageUrl = req.body.imageUrl;
            product.description = req.body.description;
            product.price = req.body.price;

            return product.save()
                .then(() => {
                    console.log('Updated Product');
                    res.redirect('/admin/products');
                })

        })
        .catch(err => {
            console.log(err);
        })
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    Product.deleteOne({ _id: productId, userId: req.user._id })
        .then(() => {
            console.log('Deleted Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
};