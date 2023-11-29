const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const adminRoutes = require('./Routes/Admin');
const shopRoutes = require('./Routes/Shop');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'Views', '404.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

