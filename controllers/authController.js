const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const user = require('../models/user');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'geo46@ethereal.email',
        pass: 'tmzcRJrwNgYUassryh'
    }
});


module.exports.getLogin = (req, res, next) => {
    let message = req.flash();
    if (message.error) {
        message = message.error[0];
    } else {
        message = null;
    }
    console.log(message);
    res.render('auth/login', {
        title: 'Login',
        path: '/login',
        errorMessage: message
    });
}

module.exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/login');
            }

            bcrypt.compare(password, user.password, (err, result) => {

                if (err) {
                    req.flash('error', 'Invalid username or password');
                    return res.redirect('/login');
                }
                if (result) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        if (err) {
                            console.log(err);
                        }
                        req.flash('success', 'Logged in successfully');
                        res.redirect('/');
                    });
                }
                req.flash('error', 'Invalid username or password');
                res.redirect('/login');
            });
        })
        .catch(err => {
            console.log(err);
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

module.exports.getSignup = (req, res, next) => {
    let message = req.flash();
    if (message.error) {
        message = message.error[0];
    } else {
        message = null;
    }
    console.log(message);
    res.render('auth/signup', {
        title: 'Signup',
        path: '/signup',
        errorMessage: message
    });
}

module.exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const email = req.body.email;

    User.findOne({ username: username })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Username already exists');
                return res.redirect('/signup');
            }
            User.findOne({ email: email }).then(userDoc => {
                if (userDoc) {
                    req.flash('error', 'Email already exists');
                    return res.redirect('/signup');
                }
                bcrypt.hash(password, 12, (err, hash) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    const user = new User({
                        username: username,
                        password: hash,
                        email: email,
                        cart: { items: [] }
                    });

                    user.save()
                        .then(result => {
                            req.flash('success', 'Account created successfully');
                            res.redirect('/login');
                            transporter.sendMail({
                                from: 'your.email@example.com',
                                to: user.email,
                                subject: 'Welcome, ' + user.username + '!',
                                text: `Dear ${user.username},\n\nWelcome to OurApp! Your account has been created successfully.\n\nBest regards,\nYour App Team`,
                                html: `<p>Dear ${user.username},</p>
                                    <p>Welcome to <strong>OurApp</strong>! Your account has been created successfully.</p>
                                    <p>Best regards,<br>Your App Team</p>`
                            }).then(info => {
                                const previewUrl = nodemailer.getTestMessageUrl(info);
                                console.log(previewUrl);
                            }).catch(err => {
                                console.log(err);
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        });
                });
            });
        })
        .catch(err => {
            console.log(err);
        });


}

module.exports.getResetPassword = (req, res, next) => {
    let message = req.flash();
    if (message.error) {
        message = message.error[0];
    } else {
        message = null;
    }
    console.log(message);
    res.render('auth/reset-password', {
        title: 'Reset Password',
        path: '/reset-password',
        errorMessage: message
    });
}

module.exports.postResetPassword = (req, res, next) => {
    const token = generateToken();
    const email = req.body.email;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'No user found with that email');
                return res.redirect('/reset-password');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save()
                .then(result => {
                    res.redirect('/');
                    transporter.sendMail({
                        from: 'your.email@example.com',
                        to: user.email,
                        subject: "Password Reset Instructions",
                        html: `
                            <p>Dear ${user.username},</p>
                            <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
                            <p>To reset your password, click on the following link:</p>
                            <p><a href="http://localhost:3000/reset-password/${token}">Reset Password</a></p>
                            <p>This link will expire in one hour for security reasons.</p>
                            <p>If you are having trouble, copy and paste the following URL into your browser:</p>
                            <p>http://localhost:3000/reset-password/${token}</p>
                            <p>Thank you for using our services.</p>
                            <p>Best regards,<br>Your App Team</p>
                        `,
                    }).then(info => {
                        const previewUrl = nodemailer.getTestMessageUrl(info);
                        console.log(previewUrl);
                    }).catch(err => {
                        console.log(err);
                    });
                })
        })
        .catch(err => {
            console.log(err);
        });

}

module.exports.getNewPassword = (req, res, next) => {
    let message = req.flash('error');

    if (message.error) {
        message = message.error[0];
    } else {
        message = null;
    }
    console.log(message);

    const token = req.params.token;

    user.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid token');
                return res.redirect('/reset-password');
            }
            res.render('auth/new-password', {
                title: 'New Password',
                path: '/new-password',
                token: token,
                errorMessage: message,
                userId: user._id.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports.postSetPassword = (req, res, next) => {
    const userId = req.body.userId;
    const token = req.body.token;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    user.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'this link is expired or invalid token provided by you is not correct please try again with valid token or request for new token by clicking on forgot password');
                return res.redirect('/reset-password');
            }
            bcrypt.hash(password, 12, (err, hash) => {
                if (err) {
                    console.log(err);
                    return;
                }
                user.password = hash;
                user.resetToken = undefined;
                user.resetTokenExpiration = undefined;
                return user.save()
                    .then(result => {
                        res.redirect('/login');
                        transporter.sendMail({
                            from: 'your.email@example.com',
                            to: user.email,
                            subject: 'Password Changed Successfully',
                            text: `Dear ${user.username},\n\nYour password for OurApp has been successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nYour App Team`,
                            html: `<p>Dear ${user.username},</p>
                                <p>Your password for <strong>OurApp</strong> has been successfully changed.</p>
                                <p>If you did not make this change, please contact our support team immediately.</p>
                                <p>Best regards,<br>Your App Team</p>`
                        }).then(info => {
                            const previewUrl = nodemailer.getTestMessageUrl(info);
                            console.log(previewUrl);
                        }).catch(err => {
                            console.log(err);
                        });
                    })
            });
        })
        .catch(err => {
            console.log(err);
        });
}

// Function to generate a random token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}
