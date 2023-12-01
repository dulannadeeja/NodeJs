const express = require('express');
const router = express.Router();

const authentication = require('../middleware/authentication');

const shopController = require('../controllers/shopController');

router.get('/', shopController.getShop);
router.get('/cart', authentication, shopController.getCart);
router.get('/checkout', shopController.getCheckout);
router.get('/checkout/success', shopController.getCheckoutSuccess);
router.get('/checkout/cancel', shopController.getCheckout);
router.get('/orders', authentication, shopController.getOrders);
router.get('/product/:productId', shopController.getProductView);
router.get('/all-products', shopController.getProducts);
router.post('/add-to-cart', authentication, shopController.addToCart);
router.post('/cart-delete-item', authentication, shopController.postCartDeleteItem);
router.get('/orders/:orderId', authentication, shopController.getInvoice);

module.exports = router; 