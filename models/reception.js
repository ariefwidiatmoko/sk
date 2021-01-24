const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Reception = sequelize.define('reception', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  code: Sequelize.STRING,
  date: Sequelize.STRING,
  accountCode: Sequelize.STRING,
  type: Sequelize.STRING,
  name: Sequelize.STRING,
  sum: Sequelize.STRING,
  unit: Sequelize.STRING,
  total: Sequelize.STRING,
  remarks: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Reception;
