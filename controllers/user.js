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
    const userId = req.userId;
    const checkErr = await authScope(userId, 'user', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const number = parseInt(req.body.number);
    const page = parseInt(req.body.page);
    const search = req.body.search;
    const query = {
      where: { deletedAt: { [Op.is]: null } },
      include: [{ model: Profile, attributes: ['name', 'logs'] }],
      limit: number,
      offset: (page - 1) * number || 0,
    };
    if (search && search === 'deleted') {
      query.where = { deletedAt: { [Op.ne]: null } };
    } else if (search) {
      query.where = {
        [Op.and]: [
          { deletedAt: { [Op.is]: null } },
          {
            [Op.or]: [
              { username: { [Op.substring]: search } },
              { '$Profile.name$': { [Op.substring]: search } },
            ],
          },
        ],
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
    const getRoles = await Role.findAll({ attributes: ['id', 'name'] });
    const countResult = fetchData.count;
    const usersResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
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
    const userId = req.userId;
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
// url: /localhost:3000/api/users/create method: 'POST'
exports.userCreate = async (req, res, next) => {
  try {
    const authId = req.userId;
    const checkErr = await authScope(authId, 'user', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password;
    const actionBy = req.body.actionBy;
    const time = new Date().toISOString();
    const logs = [{
      action: 'create',
      user: {
        id: authId,
        username: actionBy,
      },
      time: time,
    }];
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
      logs: JSON.stringify(logs),
    });
    const newEntry = await data.save();
    const profile = new Profile({
      type: 'User',
      name: name,
      userId: newEntry.id,
      memberStatus: false,
      activeStatus: false,
      logs: JSON.stringify(logs),
    });
    const newEntryProfile = await profile.save();
    if (!newEntry || !newEntryProfile) {
      const error = new Error('Gagal membuat user baru!');
      error.statusCode = 404;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: newEntry.id },
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
// url: /localhost:3000/api/users/edit/:userId method: 'POST'
exports.userEdit = async (req, res, next) => {
  const userId = req.params.userId;
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();

  try {
    const checkErr = await authScope(authId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into profile.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const entry = await Profile.findOne({ where: { userId: userId } });
    if (!entry) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const entryLogs = JSON.parse(entry.logs);
    const editLog = {
      action: 'edit',
      user: {
        id: authId,
        username: actionBy,
      },
      time: time,
    }
    entryLogs.push(editLog);
    obj.logs = entryLogs;
    const updateEntry = await entry.update(obj);
    if (!updateEntry) {
      const error = new Error('Update user gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getUpdateEntry = await User.scope('withoutPassword').findOne({
      where: { id: updateEntry.userId },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUpdateEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/password-reset/:userId method: 'POST'
exports.userPasswordReset = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const userId = req.params.userId;
    const password = req.body.password;
    const updatedBy = req.body.updatedBy;
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
  try {
    const checkErr = await authScope(req.userId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const userId = req.params.userId;
    const username = req.body.username;
    const checkId = await User.findByPk(userId);
    if (checkId.roles === 'SA') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
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
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();
  try {
    const checkErr = await authScope(authId, 'user', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findByPk(userId);
    if (!entry) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (entry.roles === 'SA') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const entryLogs = JSON.parse(entry.logs);
    const editLogs = {
      action: 'edit',
      user: {
        id: authId,
        username: actionBy,
      },
      time: time,
    };
    entryLogs.push(editLogs);
    const newData = {
      roles: entry.roles === 'SA' ? 'SA' : req.body.roles,
      logs: entryLogs,
    };
    const updateEntry = await entry.update(newData);
    if (!updateEntry) {
      const error = new Error('Update role gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getUpdateEntry = await User.scope('withoutPassword').findOne({
      where: { id: updateEntry.id },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUpdateEntry,
      profile: getUpdateEntry.profile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/delete/:userId method: 'POST'
exports.userDelete = async (req, res, next) => {
  const userId = req.params.userId;
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();
  try {
    const checkErr = await authScope(authId, 'user', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findOne({
      where: { id: userId },
      include: [{ model: Profile }],
    });
    const entryProfile = await Profile.findOne({
      where: { userId: userId },
    });
    if (!entry) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (entry.roles === 'SA') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const softDel = {
      action: 'delete',
      user: { id: req.userId, username: actionBy },
      time: time,
    };
    let entryLogs = JSON.parse(entry.logs);
    entryLogs.push(softDel);
    const updateEntry = await entry.update({
      logs: JSON.stringify(entryLogs),
      deletedAt: time,
    });
    let entryProfileLogs = JSON.parse(entryProfile.logs);
    entryProfileLogs.push(softDel);
    await entryProfile.update({
      logs: JSON.stringify(entryProfileLogs),
      deletedAt: time,
    });
    res.status(200).json({
      message: 'success',
      user: { id: updateEntry.id, username: updateEntry.username },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/restore/:userId method: 'POST'
exports.userRestore = async (req, res, next) => {
  const userId = req.params.userId;
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();
  try {
    const checkErr = await authScope(authId, 'user', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findOne({
      where: { id: userId },
    });
    const entryProfile = await Profile.findOne({
      where: { userId: userId },
    });
    if (!entry) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const restoreLog = {
      action: 'restore',
      user: { id: authId, username: actionBy },
      time: time,
    };
    let entryLogs = JSON.parse(entry.logs);
    entryLogs.push(restoreLog);
    const updateEntry = await entry.update(
      {
        deletedAt: null,
        logs: JSON.stringify(entryLogs),
      },
      { omitNull: false }
    );
    let entryProfileLogs = JSON.parse(entryProfile.logs);
    entryProfileLogs.push(restore);
    await entryProfile.update(
      {
        deletedAt: null,
        logs: JSON.stringify(entryProfileLogs),
      },
      { omitNull: false }
    );
    res.status(200).json({
      message: 'ok',
      user: {
        id: updateEntry.id,
        username: updateEntry.username,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/hard-delete/:userId method: 'POST'
exports.userHardDel = async (req, res, next) => {
  const userId = req.params.userId;
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();
  try {
    const checkErr = await authScope(authId, 'user', 'h');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findOne({
      where: { id: userId },
      include: [{ model: Profile }],
    });
    const entryProfile = await Profile.findOne({
      where: { userId: userId },
    });
    if (!entry) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (entry.roles === 'SA') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const data = JSON.stringify(entry.toJSON());
    const table = JSON.stringify(['user', 'profile']);
    const logs = {
      action: 'hardel',
      user: { id: authId, username: actionBy },
      time: time,
    };
    const dataRecyclebin = new Recyclebin({
      itemId: entry.id,
      name: entry.username,
      category: 'User',
      table: table,
      data: data,
      logs: JSON.stringify(logs),
      deletedAt: time,
      userId: userId,
    });
    const newRecyclebin = await dataRecyclebin.save();
    if (!newRecyclebin) {
      const error = new Error('Gagal menghapus User!');
      error.statusCode = 404;
      return next(error);
    }
    const deletedEntry = entry.destroy();
    entryProfile.destroy();
    if (!deletedEntry) {
      const error = new Error('Gagal menghapus User!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      user: { id: newRecyclebin.itemId, username: newRecyclebin.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/users/import method: 'POST'
exports.usersImport = async (req, res, next) => {
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();
  try {
    const checkErr = await authScope(authId, 'user', 'i');
    if (checkErr) {
      return next(checkErr);
    }
    const users = JSON.parse(req.body.users);
    const logs = {
      action: 'create',
      user: {
        id: authId,
        username: actionBy,
      },
      time: time,
    };
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
          logs: logs,
        });
        const newUser = await data.save();
        const profile = new Profile({
          profileType: 'profileType',
          name: nameData,
          logs: logs,
          userId: newUser.id,
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
