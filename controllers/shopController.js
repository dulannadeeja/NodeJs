const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

module.exports.getProducts = (req, res) => {
    Product.find()
        .then((products) => {
            res.render('shop/product-list', {
                title: 'All Products',
                path: '/all-products',
                products: products
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

module.exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout'
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


module.exports.postOrder = (req, res) => {
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
