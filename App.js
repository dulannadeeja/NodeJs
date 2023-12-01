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
const multer = require('multer');


// Multer configuration
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Multer file filter configuration
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});

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
// Set up multer middleware
app.use(upload.single('productImage'));
// Set up static folder
app.use(express.static(path.join(rootDir, 'Public')));
// Set up uploads folder
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
// Set up session middleware
app.use(session({ secret: 'mdwmiudnwbnybdVs', store: store, resave: false, saveUninitialized: false }));
// Set up csurf middleware
app.use(csrfProtection);
// Set up flash middleware
app.use(flash());


// Middleware to add user to the request
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                throw new Error('User cannot be found in the system. Please log in again.');
            }
            req.user = user;
            next();
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
});

// Middleware to add CSRF token and authentication to the view locals
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.log("here in error handling middleware" + error);

    if (!req.session) {
        const error = new Error('Session cannot be found. Please log in again.');
        error.httpStatusCode = 500;
        return next(error);

    }

    res.status(500).render('500', {
        title: 'Server Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: res.locals.csrfToken,
        errorMessage: error.message,
        error: error
    });
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
