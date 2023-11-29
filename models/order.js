const sequelize = require('sequelize');

const sequelizeConnection = require('../utils/database');

const Order = sequelizeConnection.define('order', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Order;