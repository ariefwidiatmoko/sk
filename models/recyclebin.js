const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Recyclebin = sequelize.define(
  'recyclebin',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    itemId: Sequelize.INTEGER,
    name: Sequelize.STRING,
    category: Sequelize.STRING,
    table: Sequelize.STRING,
    data: Sequelize.TEXT,
    logs: Sequelize.TEXT('long'),
    deletedAt: Sequelize.STRING,
  }
);

module.exports = Recyclebin;
