const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Autojournal = sequelize.define('autojournal', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  code: Sequelize.STRING,
  name: Sequelize.STRING,
  code: Sequelize.STRING,
  debit: Sequelize.STRING,
  credit: Sequelize.STRING,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Autojournal;
