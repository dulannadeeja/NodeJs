const User = require('../models/user');

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        title: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn
    });
}

module.exports.postLogin = (req, res, next) => {
    User.findById("6554a834f42db2d46d274592")
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save((err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.redirect('/');
            });
        })
        .catch(err => {
            console.log("user not found!" + err);
        });
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return;
        }
        res.redirect('/');
    });
}