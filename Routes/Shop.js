const express = require('express');
const router = express.Router();

const adminData = require('./Admin');

router.get('/', (req, res) => {
    console.log(adminData.products);
    res.render('shop', {
        title: 'Shop',
        path: '/',
        products: adminData.products
    });
});

module.exports = router;