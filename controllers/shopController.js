const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51OIPjfIXiEz0hTpi7CpeRalG9iIVmlFAoRjo8kJJuVleVjtiMzDlnbjIayBrfxf1bdaPdetQIPCVTTyDyDfruDBO0000Blimtm');

module.exports.getProducts = (req, res) => {

    const page = +req.query.page || 1;
    const itemsPerPage = 4;
    let totalItemsInDb;

    Product.find().countDocuments()
        .then(numProducts => {
            totalItemsInDb = numProducts;
            return Product.find()
                .skip((page - 1) * itemsPerPage)
                .limit(itemsPerPage);
        })
        .then((products) => {
            res.render('shop/product-list', {
                title: 'All Products',
                path: '/all-products',
                products: products,
                currentPage: page,
                lastPage: Math.ceil(totalItemsInDb / itemsPerPage)
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.getProductView = (req, res) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-view', {
                title: product.title,
                path: '/all-products',
                product: product
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.getShop = (req, res) => {
    res.render('shop/index', {
        title: 'Shop',
        path: '/'
    });
}

module.exports.getCart = (req, res) => {

    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    ...item.productId.toObject(),
                    qty: item.qty,
                    total: item.qty * item.productId.price
                };
            });

            console.log(products);

            res.render('shop/cart', {
                title: 'Cart',
                path: '/cart',
                products: products,
                totalPrice: calcCartTotal(products)
            });
        })
        .catch(err => {
            console.log(err);
        });

};

const calcCartTotal = (products) => {
    let totalPrice = 0;

    products.forEach(product => {
        totalPrice += product.total;
    });

    return totalPrice;
}

module.exports.getCheckout = (req, res, next) => {

    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    ...item.productId.toObject(),
                    qty: item.qty,
                    total: item.qty * item.productId.price
                };
            });

            const totalPrice = calcCartTotal(products);

            stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment', // Add this line to specify the mode
                line_items: products.map(product => {
                    return {
                        price_data: {
                            currency: 'usd',
                            unit_amount: product.price * 100,
                            product_data: {
                                name: product.title,
                                description: product.description,
                                images: [req.protocol + '://' + req.get('host') + '/' + product.imageUrl]
                            }
                        },
                        quantity: product.qty
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
            }).then((paymentIntent) => {
                console.log(paymentIntent);
                res.render('shop/checkout', {
                    clientSecret: paymentIntent.client_secret,
                    title: 'Checkout',
                    path: '/checkout',
                    totalPrice: totalPrice,
                    stripePublicKey: 'pk_test_51OIPjfIXiEz0hTpidm8Auk1aoaw9LsEOXKZckSEZepyq29RLIlClb6lEmiyxr8I62JNpTf7C6CgHwqG3izOgKtcS000InFUGuS',
                    errorMessage: null,
                    products: products,
                    sessionId: paymentIntent.id
                });
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error); // Passing the error to the next middleware
        });
}

module.exports.getOrders = (req, res) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                title: 'Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.addToCart = (req, res) => {

    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {
            req.user.addToCart(product)
                .then(() => {
                    res.redirect('/cart');
                })
                .catch(err => {
                    console.log(err);
                });
        });


}

module.exports.postCartDeleteItem = (req, res) => {
    const productId = req.body.productId;

    req.user.deleteCartItem(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
        });
};


module.exports.getCheckoutSuccess = (req, res) => {
    const user = req.user;
    user.populate('cart.items.productId')
        .then(user => {

            const products = user.cart.items.map(item => {
                return { product: { ...item.productId.toObject() }, qty: item.qty, total: item.qty * item.productId.price };
            });
            const totalPrice = calcCartTotal(products);

            const order = new Order({
                user: {
                    username: user.username,
                    userId: user._id
                },
                products: products,
                totalPrice: totalPrice,
                address: '1234 Main St.',
                paymentMethod: 'Cash',
                paymentStatus: 'Paid',
                deliveryStatus: 'Not Shipped',
                date: new Date()
            });
            order.save()
                .then(() => {
                    user.clearCart()
                        .then(() => {
                            res.redirect('/orders');
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        })
}

module.exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
        .populate('products.product') // Assuming 'products' field in Order model contains references to products
        .then(order => {
            if (!order) {
                const error = new Error('Order not found.');
                error.httpStatusCode = 404;
                throw error;
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                console.log('Unauthorized access to invoice.');
                const error = new Error('You are not authorized to view this invoice.');
                error.httpqStatusCode = 403;
                throw error;
            }

            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            // Set response headers for PDF file
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

            // Check if invoice already exists
            if (fs.existsSync(invoicePath)) {



                // Return the existing invoice
                fs.createReadStream(invoicePath).pipe(res);
                return;
            }

            const pdfDoc = new PDFDocument();

            // Pipe the PDF document to a writable stream
            const pdfStream = fs.createWriteStream(invoicePath);
            pdfDoc.pipe(pdfStream);
            pdfDoc.pipe(res);


            // Add content to the PDF
            pdfDoc.fontSize(26).text('Invoice', { underline: true }).moveDown();
            pdfDoc.text(`Order ID: ${orderId}`).moveDown();

            pdfDoc.fontSize(14).text('Order Details:', { underline: true }).moveDown();

            let totalPrice = 0;

            order.products.forEach((product, index) => {
                const { title, price } = product.product;
                const lineTotal = product.qty * price;
                totalPrice += lineTotal;

                pdfDoc.fontSize(12)
                    .text(`${index + 1}. ${title} - ${product.qty} x $${price} = $${lineTotal}`)
                    .moveDown(0.5);
            });

            pdfDoc.moveDown().text('-----------------------').moveDown();
            pdfDoc.fontSize(18).text(`Total Price: $${totalPrice}`, { underline: true }).moveDown(2);

            pdfDoc.end();

            // Handle the end event to close the stream after finishing writing
            pdfStream.on('finish', () => {
                console.log('PDF written successfully.');
            });

        })
        .catch(err => {
            res.render('401', {
                title: 'Page Not Found',
                path: '/401',
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: err.message,
                csrfToken: res.locals.csrfToken
            });
        });
};
