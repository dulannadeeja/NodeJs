const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../utils/file');

module.exports.getProducts = (req, res) => {
    Product.find({ userId: req.user._id })
        .then((products) => {

            if (!products) {
                throw new Error('Products cannot be found in the system. Please try again.');
            }

            res.render('admin/products', {
                title: 'All Products',
                path: '/admin/products',
                products: products,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
}

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        title: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        product: {
            title: '',
            imageUrl: '',
            description: '',
            price: ''
        },
        validationErrors: []
    });
}

module.exports.postAddProduct = (req, res, next) => {

    const validationErrors = validationResult(req);

    const errorsSet = new Set();

    const errors = validationErrors.array().filter(error => {
        const exists = errorsSet.has(error.path);
        errorsSet.add(error.path);
        return !exists;
    });

    const finalErrors = Array.from(errors);

    if (!validationErrors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            title: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: {
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                price: req.body.price
            },
            validationErrors: finalErrors
        });
    }

    console.log(req.file);

    if (!req.file) {
        return res.status(422).render('admin/edit-product', {
            title: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: {
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                price: req.body.price
            },
            validationErrors: [{ param: 'imageUrl', msg: 'product image is required and it must be in jpg/png/jpeg image. size limit 5mb' }]
        });
    }


    const product = new Product({
        title: req.body.title,
        imageUrl: req.file.path.replace('\\', '/'),
        description: req.body.description,
        price: req.body.price,
        userId: req.user
    });
    product.save()
        .then((result) => {

            if (!result) {
                throw new Error('Product cannot be created. Please try again.');
            }

            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log("error occured in add product logic" + err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
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
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
}

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;

    const validationErrors = validationResult(req);

    const errorsSet = new Set();

    const errors = validationErrors.array().filter(error => {
        const exists = errorsSet.has(error.path);
        errorsSet.add(error.path);
        return !exists;
    });

    const finalErrors = Array.from(errors);

    if (!validationErrors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            title: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: productId,
                title: req.body.title,
                imageUrl: req.body.productImage,
                description: req.body.description,
                price: req.body.price
            },
            validationErrors: finalErrors
        });
    }


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

            if (!req.file && !product.imageUrl) {
                return res.status(422).render('admin/edit-product', {
                    title: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: true,
                    product: {
                        _id: productId,
                        title: req.body.title,
                        imageUrl: req.body.productImage,
                        description: req.body.description,
                        price: req.body.price
                    },
                    validationErrors: [{ path: 'productImage', msg: 'product image is required and it must be in jpg/png/jpeg image. size limit 5mb' }]
                });
            }

            const prevImageUrl = product.imageUrl ? product.imageUrl : undefined;
            const productImage = req.file ? req.file.path.replace('\\', '/') : undefined;

            product.title = req.body.title;
            product.imageUrl = productImage;
            product.description = req.body.description;
            product.price = req.body.price;

            return product.save()
                .then((result) => {

                    if (!result) {
                        throw new Error('Product cannot be updated. Please try again.');
                    }

                    console.log('Updated Product');
                    res.redirect('/admin/products');

                    if (prevImageUrl && prevImageUrl !== productImage) {
                        fileHelper.deleteFile(prevImageUrl);
                    }

                }).catch(err => {
                    throw new Error(err);
                });

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })
}

module.exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    let productImageUrl = undefined;

    Product.findById(productId)
        .then(product => {

            if (!product) {
                throw new Error('Product cannot be found in the system. Please try again.');
            }

            if (product.userId.toString() !== req.user._id.toString()) {
                throw new Error('Unauthorized Access');
            }

            return product;

        }).then(product => {
            productImageUrl = product.imageUrl;
            return product.deleteOne();
        }).then(result => {
            if (!result) {
                throw new Error('Product cannot be deleted. Please try again.');
            }

            console.log('Deleted Product');
            res.status(200).json({ message: 'Success!' });

            if (productImageUrl) {
                fileHelper.deleteFile(productImageUrl);
            }

        }).catch(err => {
            console.log("error occured in delete product logic" + err);
            res.status(500).json({ message: 'Deleting product failed.' });
        });
};