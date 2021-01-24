const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Loan = sequelize.define('loan', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  code: Sequelize.STRING,
  sum: Sequelize.STRING,
  month: Sequelize.STRING,
  interest : Sequelize.STRING,
  fees: Sequelize.STRING,
  primary: Sequelize.STRING,
  total: Sequelize.STRING,
  installment: Sequelize.STRING,
  installmentFix: Sequelize.STRING,
  paid: Sequelize.STRING,
  left: Sequelize.STRING,
  payment: Sequelize.STRING,
  date: Sequelize.STRING,
  remarks: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Loan;
