const express = require('express');
const router = express.Router();
const path = require('path');

const rootDir = require('../Utils/Path');

const products = [];

router.get('/add-product', (req, res) => {
    res.sendFile(path.join(rootDir, 'Views', 'add-product.html'));
});

router.post('/add-product', (req, res) => {
    products.push({ title: req.body.title });
    res.redirect('/admin/add-product');
});

module.exports.router = router;
module.exports.products = products;