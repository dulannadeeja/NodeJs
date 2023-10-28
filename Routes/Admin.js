const express = require('express');
const router = express.Router();
const path = require('path');

const rootDir = require('../Utils/Path');

router.get('/add-product', (req, res) => {
    res.sendFile(path.join(rootDir, 'Views', 'add-product.html'));
});

router.post('/add-product', (req, res) => {
    console.log(req.body);
    res.redirect('/admin/add-product');
});

module.exports = router;