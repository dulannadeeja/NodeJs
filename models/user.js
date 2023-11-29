const sequelize = require('sequelize');

const sequelizeConnection = require('../utils/database');

const User = sequelizeConnection.define('user', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: sequelize.STRING,
    email: sequelize.STRING
});

module.exports = User;