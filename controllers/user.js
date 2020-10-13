const User = require('../models/user');
const Profile = require('../models/profile');
const Role = require('../models/role');
const Recyclebin = require('../models/recyclebin');
const bcrypt = require('bcryptjs');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
// url: /localhost:3000/api/users method: 'GET'
exports.usersIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'user', 'v');
    const number = parseInt(req.body.number);
    const page = parseInt(req.body.page);
    const search = req.body.search;
    if (checkErr) {
      return next(checkErr);
    }
    const query = {
      include: [{ model: Profile, attributes: ['name'] }],
      limit: number,
      offset: (page - 1) * number || 0,
    };
    if (search) {
      query.where = {
        [Op.or]: [
          {username: { [Op.substring]: search }},
          {'$Profile.name$': { [Op.substring]: search }},
        ]
      };
    }
    const fetchData = await User.scope('withoutPassword').findAndCountAll(
      query
    );
    if (!fetchData) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const getRoles = await Role.findAll({ attributes: ['id', 'roleName'] });
    const countResult = fetchData.count;
    const usersResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      totals: countResult,
      users: usersResult,
      roles: getRoles,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/roles method: 'GET'
exports.rolesIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    let fetchData = await Role.findAndCountAll();
    if (!fetchData) {
      const error = new Error('Role tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let fetchCount = fetchData.count;
    let fetchRow = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      result: fetchCount,
      roles: fetchRow,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/:userId method: 'GET'
exports.userGet = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const checkErr = await authScope(req.userId, 'user', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: userId },
      include: [{ model: Profile }],
    });
    if (!getUser) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      user: getUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/edit/:userId method: 'POST'
exports.userEdit = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into profile.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const userId = req.params.userId;
    const profile = await Profile.findOne({ where: { userId: userId } });
    if (!profile) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updatedProfile = await profile.update(obj);
    if (!updatedProfile) {
      const error = new Error('Update user gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: updatedProfile.userId },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/password-reset/:userId method: 'POST'
exports.userPasswordReset = async (req, res, next) => {
  const userId = req.params.userId;
  const password = req.body.password;
  const updatedBy = req.body.updatedBy;
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const hashPass = await bcrypt.hash(password, 12);
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updatedUser = await user.update({
      password: hashPass,
      updatedBy: updatedBy,
    });
    if (!updatedUser) {
      const error = new Error('Reset password gagal!');
      error.statusCode = 404;
      return next(error);
    }
    let getUser = await User.scope('withoutPassword').findOne({
      where: { id: updatedUser.id },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUser,
      profile: getUser.profile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/account-edit/:userId method: 'POST'
exports.userAccountEdit = async (req, res, next) => {
  const userId = req.params.userId;
  const username = req.body.username;
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const checkId = await User.findByPk(userId);
    if (checkId.arrRoles === 'SA') {
      const error = new Error(`Kamu tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    if (username !== checkId.username) {
      const checkUsername = await User.findOne({
        where: { username: username },
      });
      if (checkUsername) {
        const error = new Error('Username sudah digunakan');
        error.statusCode = 422;
        return next(error);
      }
    }
    const newData = {};
    newData.username = username;
    newData.updatedBy = req.body.updatedBy;
    let getUser;
    if (req.body.resetPassword) {
      let hashPass = await bcrypt.hash(req.body.resetPassword, 12);
      newData.password = hashPass;
    }
    const updatedUser = await checkId.update(newData);
    if (!updatedUser) {
      const error = new Error('Update akun gagal!');
      error.statusCode = 404;
      return next(error);
    }
    getUser = await User.scope('withoutPassword').findOne({
      where: { id: updatedUser.id },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUser,
      profile: getUser.profile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/role-edit/:userId method: 'POST'
exports.userRoleEdit = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const checkUser = await User.findByPk(userId);
    if (!checkUser) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (checkUser.arrRoles === 'SA') {
      const error = new Error(`Kamu tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const newData = {
      arrRoles: checkUser.arrRoles === 'SA' ? 'SA' : req.body.arrRoles,
      updatedBy:
        checkUser.arrRoles === 'SA' ? checkUser.updatedBy : req.body.updatedBy,
    };
    const updatedUser = await checkUser.update(newData);
    if (!updatedUser) {
      const error = new Error('Update role gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: updatedUser.id },
      include: [{ model: Profile }],
    });
    const getRoles = await Role.findAll({
      attributes: ['id', 'roleName', 'arrAuthorities'],
    });
    res.status(200).json({
      message: 'ok',
      user: getUser,
      profile: getUser.profile,
      arrAuth: getRoles,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/create method: 'POST'
exports.userCreate = async (req, res, next) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;
  const createdBy = req.body.createdBy;
  try {
    const checkErr = await authScope(req.userId, 'user', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const checkUsername = await User.findOne({ where: { username: username } });
    if (checkUsername) {
      const error = new Error('Username sudah digunakan!');
      error.statusCode = 422;
      return next(error);
    }
    const hashPass = await bcrypt.hash(password, 12);
    const data = new User({
      username: username,
      password: hashPass,
      createdBy: createdBy,
    });
    const newUser = await data.save();
    const profile = new Profile({
      profileType: 'profileType',
      name: name,
      userId: newUser.id,
      createdBy: createdBy,
    });
    const newProfile = await profile.save();
    if (!newUser || !newProfile) {
      const error = new Error('Gagal membuat user baru!');
      error.statusCode = 404;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: newProfile.userId },
      include: [{ model: Profile }],
    });
    res.status(201).json({
      message: 'ok',
      user: getUser,
      profile: getUser.profile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/delete/:userId method: 'POST'
exports.userDelete = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const checkErr = await authScope(req.userId, 'user', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const checkUser = await User.findOne({
      where: { id: userId },
      include: [{ model: Profile }],
    });
    if (!checkUser) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (checkUser.arrRoles === 'SA') {
      const error = new Error(`kamu tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const data = JSON.stringify(checkUser.toJSON());
    const dataRecyclebin = new Recyclebin({
      itemId: checkUser.id,
      category: 'User',
      data: data,
      deletedBy: req.userId,
    });
    const newRecyclebin = await dataRecyclebin.save();
    if (!newRecyclebin) {
      const error = new Error('Gagal menghapus user!');
      error.statusCode = 404;
      return next(error);
    }
    const checkDelete = checkUser.destroy();
    if (!checkDelete) {
      const error = new Error('Gagal menghapus user!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      userId: newRecyclebin.itemId,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/import method: 'POST'
exports.usersImport = async (req, res, next) => {
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'user', 'i');
    if (checkErr) {
      return next(checkErr);
    }
    const users = JSON.parse(req.body.users);
    const createdBy = userId;
    let usersError = [];
    let usersSuccess = [];
    for (let i = 0; i < users.length; i++) {
      let usernameData = users[i].Username;
      let nameData = users[i].Panggilan;
      let passwordData = users[i].Password + '';
      const checkUsername = await User.findOne({
        where: { username: usernameData },
      });
      if (checkUsername) {
        usersError.push(usernameData);
      } else {
        const hashPass = await bcrypt.hash(passwordData, 12);
        const data = new User({
          username: usernameData,
          password: hashPass,
          createdBy: createdBy,
        });
        const newUser = await data.save();
        const profile = new Profile({
          profileType: 'profileType',
          name: nameData,
          userId: newUser.id,
          createdBy: createdBy,
        });
        const newProfile = await profile.save();
        usersSuccess.push(usernameData);
      }
    }
    console.log('Error', usersError, 'Success', usersSuccess);
    res.status(201).json({
      message: 'ok',
      usersSuccess: usersSuccess,
      usersError: usersError,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
