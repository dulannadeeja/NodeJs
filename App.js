const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./Routes/Admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errorController');

const mongoose = require('mongoose');
const User = require('./models/user');

const rootDir = require('./utils/path');

app.set('view engine', 'ejs');
app.set('views', 'Views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'Public')));

app.use((req, res, next) => {
    User.findById("6553bac7eb6bc76a7eda2815")
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log("user not found!");
        });

});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const username = encodeURIComponent("dulannadeeja");
const password = encodeURIComponent("dnA@123");
const cluster = "cluster0.wqsv7hi.mongodb.net";
let uri = `mongodb+srv://${username}:${password}@${cluster}/node_project?retryWrites=true&w=majority`;

mongoose.connect(uri)
    .then(() => {

        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        username: "dulannadeeja",
                        email: "dulannadeeja@gmail.com",
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            });

        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
