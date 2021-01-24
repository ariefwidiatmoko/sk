const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Saving = sequelize.define('saving', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  code: Sequelize.STRING,
  primary: Sequelize.STRING,
  secondary: Sequelize.STRING,
  tertier : Sequelize.STRING,
  date: Sequelize.STRING,
  remarks: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Saving;
