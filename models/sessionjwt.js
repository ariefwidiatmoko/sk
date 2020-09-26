const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Sessionjwt = sequelize.define('sessionjwt', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  token: { type: Sequelize.STRING, allowNull: false },
  aS: Sequelize.TEXT,
});

module.exports = Sessionjwt;
