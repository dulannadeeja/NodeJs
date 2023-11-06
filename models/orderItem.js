const sequelize = require('sequelize');

const sequelizeConnection = require('../utils/database');

const OrderItem = sequelizeConnection.define('orderItem', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    qty: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});


module.exports = OrderItem;