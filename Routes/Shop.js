const express = require('express');
const router = express.Router();

router.get('/shop', (req, res) => {
    res.send('<html><body><h1>Shop</h1></body></html>');
});

module.exports = router;