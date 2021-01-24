const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Role = sequelize.define(
    'role',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: { type: Sequelize.STRING, allowNull: false},
        authorities: Sequelize.TEXT,
        logs: Sequelize.TEXT('long'),
        deletedAt: Sequelize.STRING,
    }
);

module.exports = Role;