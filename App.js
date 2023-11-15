const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const username = encodeURIComponent("dulannadeeja");
const password = encodeURIComponent("dnA@123");
const cluster = "cluster0.wqsv7hi.mongodb.net";
let uri = `mongodb+srv://${username}:${password}@${cluster}/node_project?retryWrites=true&w=majority`;
const store = new MongoDBStore({
    uri: uri,
    collection: 'sessions',
    expires: 24 * 60 * 60 * 1000
}, (err) => {
    if (err) {
        console.log(err);
    }
});
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
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
app.use(session({ secret: 'mdwmiudnwbnybdVs', store: store, resave: false, saveUninitialized: false }));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
});

app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

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
