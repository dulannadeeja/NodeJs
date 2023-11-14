const Product = require('../models/product');
const Order = require('../models/order');

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
    req.user.getCart()
        .then(products => {
            const totalPrice = calcCartTotal(products);
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

const calcCartTotal = (products) => {
    let totalPrice = 0;

    products.forEach(product => {
        totalPrice += product.totalPrice;
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
    Order.findAllOrdersOfUser(req.user._id)
        .then(orders => {
            console.log(orders);
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

    console.log(req.body);

    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {
            const productObj = new Product(product.title, product.imageUrl, product.description, product.price, product.userId, product._id)
            req.user.addToCart(productObj)
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
    req.user.deleteItemFromCart(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
        });
};


module.exports.postOrder = (req, res) => {
    let fetchedCart;

    req.user.getCart()
        .then(products => {
            fetchedCart = products;
            const totalPrice = calcCartTotal(products);
            const order = new Order(null, products, req.user._id, new Date(), totalPrice, 'pending', null);
            order.save()
                .then(() => {
                    req.user.clearCart()
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
