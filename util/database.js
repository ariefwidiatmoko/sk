const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('koperasi', 'root', 'PCa]_@!LA7]hdMxf', {
  dialect: 'mysql',
  host: 'localhost',
  timezone: '+07:00',
  logging: false,
  omitNull: true
});

module.exports = sequelize;
