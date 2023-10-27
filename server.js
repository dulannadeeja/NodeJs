const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/add-product', (req, res) => {
    res.send('<html><body><h1>Add Product</h1><form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form></body></html>');
});

app.post('/product', (req, res) => {
    console.log(req.body);
    res.redirect('/');
});

app.use('/', (req, res) => {
    res.send('<html><body><h1>Home Page</h1></body></html>');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

