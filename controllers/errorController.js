module.exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    });
}