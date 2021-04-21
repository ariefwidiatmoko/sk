const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Profile = sequelize.define('profile', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  type: { type: Sequelize.STRING, allowNull: false }, //{type: ['Administrator', 'User', 'Anggota', 'Pengurus']}
  code: Sequelize.STRING,
  name: Sequelize.STRING,
  fullname: Sequelize.STRING,
  mainPhoto: Sequelize.STRING,
  photos: Sequelize.STRING,
  gender: Sequelize.STRING,
  pob: Sequelize.STRING,
  dob: Sequelize.STRING,
  phone: Sequelize.STRING,
  email: Sequelize.STRING,
  address: Sequelize.TEXT,
  occupation: Sequelize.STRING,
  joinDate: Sequelize.STRING,
  memberStatus: Sequelize.BOOLEAN,
  activeStatus: Sequelize.BOOLEAN,
  maritalStatus: Sequelize.STRING,
  religion: Sequelize.STRING,
  religionDetail: Sequelize.STRING,
  hobbies: Sequelize.STRING,
  about: Sequelize.STRING,
  others: Sequelize.TEXT,
  logs: Sequelize.TEXT('long'),
  deletedAt: Sequelize.STRING,
});

module.exports = Profile;
