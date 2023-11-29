const sequelize = require('sequelize');

const sequelizeConnection = require('../utils/database');

const Cart = sequelizeConnection.define('cart', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Cart;