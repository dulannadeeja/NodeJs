const express = require('express');
const router = express.Router();
const path = require('path');

const rootDir = require('../Utils/Path');
const adminData = require('./Admin');

router.get('/', (req, res) => {
    console.log(adminData.products);
    res.sendFile(path.join(rootDir, 'Views', 'shop.html'));
});

module.exports = router;