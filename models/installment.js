const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Installment = sequelize.define('installment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  code: Sequelize.STRING,
  sum: Sequelize.STRING,
  num: Sequelize.STRING,
  paid: Sequelize.STRING,
  date: Sequelize.STRING,
  remarks: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Installment;
