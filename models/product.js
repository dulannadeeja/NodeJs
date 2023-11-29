const sequelize = require('sequelize');

const sequelizeConnection = require('../utils/database');

const Product = sequelizeConnection.define('product', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: sequelize.STRING,
    price: {
        type: sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: sequelize.STRING,
        allowNull: false
    },
    description: {
        type: sequelize.STRING,
        allowNull: false
    }
});

module.exports = Product;

