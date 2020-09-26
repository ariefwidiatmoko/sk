const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    username: { type: Sequelize.STRING, allowNull: false, unique: 'main' },
    password: { type: Sequelize.STRING, allowNull: false },
    arrRoles: Sequelize.STRING,
    createdBy: Sequelize.STRING,
    updatedBy: Sequelize.STRING,
    deletedAt: Sequelize.STRING,
    deletedBy: Sequelize.STRING,
  },
  {
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password'] },
      },
    },
  }
);

module.exports = User;
