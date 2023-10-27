const express = require('express');
const app = express();
const port = 3000;

app.use((req, res, next) => {
    console.log("Request received at " + Date.now() + " to middleware 1");
    next();
});

app.use((req, res, next) => {
    console.log("Request received at " + Date.now() + " to middleware 2");
    next();
});

app.get('/users', (req, res) => {
    res.send('<h1>This is the users page</h1>');
});

app.get('/', (req, res) => {
    res.send('<h1>This is the home page</h1>');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

