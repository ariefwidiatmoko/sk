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
    category: Sequelize.STRING,
    data: Sequelize.TEXT,
    deletedBy: Sequelize.STRING,
  }
);

module.exports = Recyclebin;
