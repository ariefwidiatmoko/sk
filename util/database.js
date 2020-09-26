const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('server-koperasi', 'root', 'a14102135', {
  dialect: 'mysql',
  host: 'localhost',
  timezone: '+07:00',
  logging: false,
  omitNull: true
});

module.exports = sequelize;
