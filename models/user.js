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
    roles: Sequelize.STRING,
    logs: Sequelize.TEXT('long'),
    deletedAt: Sequelize.STRING,
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
