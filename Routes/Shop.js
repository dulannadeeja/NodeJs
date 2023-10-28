const express = require('express');
const router = express.Router();
const path = require('path');

const rootDir = require('../Utils/Path');

router.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'Views', 'shop.html'));
});

module.exports = router;