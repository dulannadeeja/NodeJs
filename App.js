const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./Routes/Admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errorController');
const Mongodb = require('./utils/database');
const Users = require('./models/user');

const rootDir = require('./utils/path');

app.set('view engine', 'ejs');
app.set('views', 'Views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'Public')));

app.use((req, res, next) => {
    Users.findById("654d0e2efdcc3129f264fa68")
        .then(user => {
            req.user = new Users(user.username, user.email, user._id, user.cart);
            next();
        })
        .catch(err => {
            console.log("user not found!");
        });

});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


Mongodb.mongoConnect(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
