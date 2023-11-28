const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', [
    check('usernameOrEmail').notEmpty().withMessage('Please enter your username or email.').trim().toLowerCase(),
    check('password').notEmpty().withMessage('Please enter your password.')
], authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required.')
            .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
            .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens.')
            .custom(async (value) => {
                const existingUser = await User.findOne({ username: value });
                if (existingUser) {
                    throw new Error('Username is already taken. Please choose a different one.');
                }
                return true;
            })
            .toLowerCase(),

        check('email')
            .notEmpty().withMessage('Email is required.')
            .normalizeEmail()
            .trim()
            .isEmail().withMessage('Please enter a valid email address.')
            .custom(async (value) => {
                const existingEmail = await User.findOne({ email: value });
                if (existingEmail) {
                    throw new Error('This email address is already registered. Please use a different one.');
                }
                return true;
            }),

        body('password')
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
            .custom(value => !/\s/.test(value)).withMessage('Password cannot contain spaces.')
            .custom(value => !/(\w)\1{2,}/.test(value)).withMessage('Password cannot contain consecutive characters (e.g., "aaa", "123").'),

        body('confirmPassword')
            .notEmpty().withMessage('Confirm password is required.')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password and confirm password do not match.');
                }
                return true;
            })
    ], authController.postSignup
);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/reset-password/:token', authController.getNewPassword);
router.post('/set-password', authController.postSetPassword);

module.exports = router;