const Role = require('../models/role');
const User = require('../models/user');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Profile = require('../models/profile');
const Op = Sequelize.Op;
// url: /localhost:3000/api/roles method: 'GET'
exports.rolesIndex = async (req, res, next) => {
  try {
    const userId = req.userId;
    const checkErr = await authScope(userId, 'role', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const number = parseInt(req.body.number);
    const page = parseInt(req.body.page);
    const search = req.body.search;
    const query = {
      where: { deletedAt: { [Op.is]: null } },
      limit: number,
      offset: (page - 1) * number || 0,
    };
    if (search) {
      query.where = {
        [Op.and]: [
          { deletedAt: { [Op.is]: null } },
          { name: { [Op.substring]: search } },
        ],
      };
    }
    let fetchData = await Role.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Role tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let fetchCount = fetchData.count;
    let fetchRows = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: fetchCount,
      roles: fetchRows,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.roleCreate = async (req, res, next) => {
  try {
    const userId = req.userId;
    const checkErr = await authScope(userId, 'role', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    let duplicate = await Role.findOne({
      where: { name: req.body.name },
    });
    if (duplicate) {
      const error = new Error('Gunakan nama yang lain!');
      error.statusCode = 422;
      return next(error);
    }
    let role = new Role({
      name: req.body.name === 'SA' ? 'SA1' : req.body.name,
      authorities: req.body.authorities,
      createdBy: req.body.createdBy,
      userId: userId,
    });
    let newRole = await role.save();
    if (!newRole) {
      const error = new Error('Gagal membuat role baru!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(201).json({
      message: 'ok',
      role: newRole,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.roleUpdate = async (req, res, next) => {
  const roleId = req.params.roleId;
  const authId = req.userId;
  const actionBy = req.body.actionBy;
  const time = new Date().toISOString();
  try {
    const checkErr = await authScope(authId, 'role', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Role.findByPk(roleId);
    if (!entry) {
      const error = new Error('Role tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const editLog = {
      action: 'edit',
      user: {
        id: authId,
        username: actionBy,
      },
      time: time,
    }
    let entryLogs = JSON.parse(entry.logs);
    entryLogs.push(editLog)
    const updateEntry = await entry.update({
      name: req.body.name,
      authorities: req.body.authorities,
      logs: entryLogs,
    });
    if (!updateEntry) {
      const error = new Error('Update role gagal!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      role: updateEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
