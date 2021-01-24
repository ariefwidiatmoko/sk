const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Transaction = sequelize.define('transaction', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  code: Sequelize.STRING,
  date: Sequelize.STRING,
  debit: Sequelize.STRING,
  credit: Sequelize.STRING,
  remarks: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Transaction;
