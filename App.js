const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
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
const csrfProtection = csrf();
const flash = require('connect-flash');

// Import middlewares
const authentication = require('./middleware/authentication');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./Routes/Admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errorController');

const mongoose = require('mongoose');
const User = require('./models/user');

const rootDir = require('./utils/path');

app.set('view engine', 'ejs');
app.set('views', 'Views');

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
// Set up static folder
app.use(express.static(path.join(rootDir, 'Public')));
// Set up session middleware
app.use(session({ secret: 'mdwmiudnwbnybdVs', store: store, resave: false, saveUninitialized: false }));
// Set up csurf middleware
app.use(csrfProtection);
// Set up flash middleware
app.use(flash());

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

// Middleware to add CSRF token and authentication to the view locals
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(authRoutes);
app.use('/admin', authentication, adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(uri)
    .then(() => {
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
