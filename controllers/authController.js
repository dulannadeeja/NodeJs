const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const util = require('util');

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
        errorMessage: message,
        prevData: {
            usernameOrEmail: '',
            password: ''
        },
        validationErrors: []
    });
}

module.exports.postLogin = (req, res, next) => {
    const password = req.body.password;
    const result = validationResult(req);

    if (!result.isEmpty()) {
        console.log(result.array());
        return res.status(422).render('auth/login', {
            title: 'Login',
            path: '/login',
            errorMessage: result.array()[0].msg,
            prevData: {
                usernameOrEmail: req.body.usernameOrEmail,
                password: req.body.password
            },
            validationErrors: result.array()
        });
    }

    return User.findOne({ $or: [{ username: req.body.usernameOrEmail }, { email: req.body.usernameOrEmail }] })
        .then(userDoc => {
            if (!userDoc) {
                return res.status(422).render('auth/login', {
                    title: 'Login',
                    path: '/login',
                    errorMessage: 'Invalid username or email. Please check your credentials.',
                    prevData: {
                        usernameOrEmail: req.body.usernameOrEmail,
                        password: req.body.password
                    },
                    validationErrors: []
                });
            }

            return bcrypt.compare(password, userDoc.password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(422).render('auth/login', {
                            title: 'Login',
                            path: '/login',
                            errorMessage: 'Invalid password. Please check your credentials.',
                            prevData: {
                                usernameOrEmail: req.body.usernameOrEmail,
                                password: req.body.password
                            },
                            validationErrors: []
                        });
                    }

                    req.session.isLoggedIn = true;
                    req.session.user = userDoc;
                    return req.session.save(err => {
                        if (err) {
                            throw new Error(err);
                        }
                        req.flash('success', 'Logged in successfully');
                        res.redirect('/');
                    });
                });
        })
        .catch(err => {
            console.error(err);
            const error = new Error('An error occurred during login.');
            error.httpStatusCode = 500;
            next(error);
        });
}

module.exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            throw new Error(err);
        }
        res.redirect('/');
    })
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
        errorMessage: message,
        validationErrors: [],
        prevData: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
}

module.exports.postSignup = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        console.log(result.array());
        return res.status(422).render('auth/signup', {
            title: 'Signup',
            path: '/signup',
            errorMessage: result.array()[0].msg,
            validationErrors: result.array(),
            prevData: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            }
        });
    }

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    hashPromise = util.promisify(bcrypt.hash);

    hashPromise(password, 12)
        .then(hash => {
            const user = new User({
                username: username,
                password: hash,
                email: email,
                cart: { items: [] }
            });

            return user.save();

        })
        .then(user => {

            if (!user) {
                throw new Error('User cannot be created. Please try again.');
            }

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
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });

}

module.exports.getResetPassword = (req, res, next) => {
    let message = req.flash();

    message = message.error ? message.error[0] : null;

    console.log(message);
    res.render('auth/reset-password', {
        title: 'Reset Password',
        path: '/reset-password',
        errorMessage: message,
        validationErrors: [],
        prevData: {
            email: ''
        }
    });
}

module.exports.postResetPassword = (req, res, next) => {
    const token = generateToken();
    const email = req.body.email;

    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        console.log(validationErrors.array());
        return res.status(422).render('auth/reset-password', {
            title: 'Reset Password',
            path: '/reset-password',
            errorMessage: validationErrors.array()[0].msg,
            validationErrors: validationErrors.array(),
            prevData: {
                email: req.body.email
            }
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'This email address is not registered. Please use a different one or sign up for a new account.');
                return res.redirect('/reset-password');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save()
                .then(user => {

                    if (!user) {
                        const error = new Error('Token cannot be generated. Please try again.');
                        error.httpStatusCode = 500;
                        throw error;
                    }

                    res.redirect('/');
                    return transporter.sendMail({
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
                    })
                        .then(info => {
                            const previewUrl = nodemailer.getTestMessageUrl(info);
                            console.log(previewUrl);
                        })
                })
        })
        .catch(err => {
            console.error(err);
            const error = new Error('An error occurred during password reset.');
            error.httpStatusCode = 500;
            next(error);
        });

}

module.exports.getNewPassword = (req, res, next) => {
    let errorMessage = req.flash('error');

    errorMessage = errorMessage.error ? errorMessage.error[0] : null;

    console.log(errorMessage);

    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid token');
                return res.redirect('/reset-password');
            }

            res.render('auth/new-password', {
                title: 'New Password',
                path: '/new-password',
                token: token,
                errorMessage: errorMessage, // Pass the errorMessage to the view
                userId: user._id.toString(),
                validationErrors: [],
                prevData: {
                    password: '',
                    confirmPassword: ''
                }
            });
        })
        .catch(err => {
            console.error(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(err);
        });
};

module.exports.postSetPassword = (req, res, next) => {
    const userId = req.body.userId;
    const token = req.body.token;
    const password = req.body.password;

    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        console.log(validationErrors.array());
        return res.status(422).render('auth/new-password', {
            title: 'New Password',
            path: '/new-password',
            token: token,
            errorMessage: validationErrors.array()[0].msg,
            validationErrors: validationErrors.array(),
            userId: userId,
            prevData: {
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            }
        });
    }

    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'this link is expired or invalid token provided by you is not correct please try again with valid token or request for new token by clicking on forgot password');
                return res.redirect('/reset-password');
            }

            const hashPromise = util.promisify(bcrypt.hash);

            return hashPromise(password, 12)
                .then(hash => {
                    user.password = hash;
                    user.resetToken = undefined;
                    user.resetTokenExpiration = undefined;
                    return user.save()
                })
                .then(result => {

                    if (!result) {
                        throw new Error('password cannot be updated. Please try again.');
                    }

                    res.redirect('/login');
                    return transporter.sendMail({
                        from: 'your.email@example.com',
                        to: user.email,
                        subject: 'Password Changed Successfully',
                        text: `Dear ${user.username},\n\nYour password for OurApp has been successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nYour App Team`,
                        html: `<p>Dear ${user.username},</p>
                            <p>Your password for <strong>OurApp</strong> has been successfully changed.</p>
                            <p>If you did not make this change, please contact our support team immediately.</p>
                            <p>Best regards,<br>Your App Team</p>`
                    })
                })
                .then(info => {
                    const previewUrl = nodemailer.getTestMessageUrl(info);
                    console.log(previewUrl);
                })

        })
        .catch(err => {
            console.error(err);
            const error = new Error('An error occurred during password update.');
            error.httpStatusCode = 500;
            next(error);
        });
}

// Function to generate a random token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}
