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
        roleName: { type: Sequelize.STRING, allowNull: false},
        arrAuthorities: Sequelize.TEXT,
        createdBy: Sequelize.STRING,
        updatedBy: Sequelize.STRING,
        deletedAt: Sequelize.STRING,
        deletedBy: Sequelize.STRING,
    }
);

module.exports = Role;