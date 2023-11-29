const Product = require('../models/product');
const Cart = require('../models/cart');

module.exports.getProducts = (req, res) => {
    Product.findAll()
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
    Product.findAll({
        where: {
            id: productId
        }
    }).then(products => {
        res.render('shop/product-view', {
            title: products[0].title,
            path: '/all-products',
            product: products[0]
        });
    }).catch(err => {
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
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
        }).then(products => {

            let totalPrice = 0;
            products.forEach(product => {
                totalPrice += product.price * product.cartItem.qty;
            });

            res.render('shop/cart', {
                title: 'Cart',
                path: '/cart',
                products: products,
                totalPrice: totalPrice
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout'
    });
}

module.exports.getOrders = (req, res) => {
    req.user.getOrders({ include: ['products'] })
        .then(orders => {
            orders.forEach(order => {
                let totalPrice = 0;
                order.products.forEach(product => {
                    totalPrice += product.price * product.orderItem.qty;
                });
                order.totalPrice = totalPrice;
            })
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

    let fetchedCart;
    let qty = 0;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            if (products.length > 0) {
                qty = products[0].cartItem.qty + 1;
                const product = products[0];
                return product;
            } else {
                qty = 1;
                return Product.findByPk(productId);
            }
        })
        .then((product) => {
            return fetchedCart.addProduct(product, { through: { qty: qty } });
        })
        .then(() => {
            res.redirect('/cart');
        })
}

module.exports.postCartDeleteItem = (req, res) => {
    const productId = req.body.productId;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId } });
        }).then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        }).then(result => {
            res.redirect('/cart');
        }).catch(err => {
            console.log(err);
        });
};


module.exports.postOrder = (req, res) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts()
        }).then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { qty: product.cartItem.qty };
                        return product;
                    }));
                }).catch(err => {
                    console.log(err);
                });
        }).then(() => {
            fetchedCart.destroy();
        }).then(() => {
            res.redirect('/orders');
        })
}
