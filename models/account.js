const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Account = sequelize.define('account', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  code: Sequelize.STRING,
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  headerDetail: Sequelize.STRING,
  level: Sequelize.STRING,
  remarks: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Account;
