const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Profile = sequelize.define('profile', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  profileType: { type: Sequelize.STRING, allowNull: false },
  code: Sequelize.STRING,
  name: Sequelize.STRING,
  fullname: Sequelize.STRING,
  mainPhoto: Sequelize.STRING,
  arrPhotos: Sequelize.STRING,
  gender: Sequelize.STRING,
  pob: Sequelize.STRING,
  dob: Sequelize.STRING,
  phone: Sequelize.STRING,
  email: Sequelize.STRING,
  address: Sequelize.TEXT,
  occupation: Sequelize.STRING,
  joinDate: Sequelize.STRING,
  activeStatus: Sequelize.BOOLEAN,
  maritalStatus: Sequelize.STRING,
  religion: Sequelize.STRING,
  religionDetail: Sequelize.STRING,
  arrHobbies: Sequelize.STRING,
  about: Sequelize.STRING,
  arrlink: Sequelize.TEXT,
  arrOthers: Sequelize.TEXT,
  createdBy: Sequelize.STRING,
  updatedBy: Sequelize.STRING,
  deletedAt: Sequelize.STRING,
  deletedBy: Sequelize.STRING,
});

module.exports = Profile;
