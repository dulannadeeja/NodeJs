const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shopController');

router.get('/', shopController.getShop);
router.get('/cart', shopController.getCart);
// router.get('/checkout', shopController.getCheckout);
router.get('/orders', shopController.getOrders);
router.get('/product/:productId', shopController.getProductView);
router.get('/all-products', shopController.getProducts);
router.post('/add-to-cart', shopController.addToCart);
router.post('/cart-delete-item', shopController.postCartDeleteItem);
router.post('/create-order', shopController.postOrder);

module.exports = router; 