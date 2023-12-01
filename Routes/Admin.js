const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { check } = require('express-validator');

router.get('/products', adminController.getProducts);
router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', [
    check('title').trim().notEmpty().withMessage('Title is required.')
        .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters.')
        .matches(/^[a-zA-Z0-9 ]+$/).withMessage('Title can only contain letters, numbers, and spaces.'),
    check('price').trim().notEmpty().withMessage('Price is required.')
        .isFloat().withMessage('Please enter a valid price.'),
    check('description').trim().notEmpty().withMessage('Description is required.')
        .isLength({ min: 5, max: 255 }).withMessage('Description must be between 5 and 255 characters.')
], adminController.postAddProduct);
router.get('/edit-product/:productId', adminController.getEditProduct);
router.post('/edit-product', [
    check('title').trim().notEmpty().withMessage('Title is required.')
        .isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters.')
        .matches(/^[a-zA-Z0-9 ]+$/).withMessage('Title can only contain letters, numbers, and spaces.'),
    check('price').trim().notEmpty().withMessage('Price is required.')
        .isFloat().withMessage('Please enter a valid price.'),
    check('description').trim().notEmpty().withMessage('Description is required.')
        .isLength({ min: 5, max: 255 }).withMessage('Description must be between 5 and 255 characters.')
], adminController.postEditProduct);
router.delete('/product/:productId', adminController.deleteProduct);

module.exports = router;
