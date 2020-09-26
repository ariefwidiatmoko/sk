const Role = require('../models/role');
const User = require('../models/user');
const authScope = require('../middleware/auth-scope');
// url: /localhost:3000/api/roles method: 'GET'
exports.rolesIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'role', 'v');
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

exports.roleCreate = async (req, res, next) => {
  try {
    let duplicate = await Role.findOne({
      where: { roleName: req.body.roleName },
    });
    if (duplicate) {
      const error = new Error('Duplikasi Data!');
      error.statusCode = 422;
      return next(error);
    }
    let role = new Role({
      roleName: req.body.roleName === 'SA' ? 'SA1' : req.body.roleName,
      arrAuthorities: req.body.arrAuthorities,
      createdBy: req.body.createdBy,
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
  let roleId = req.params.roleId;
  try {
    let entry = await Role.findByPk(roleId);
    if (!entry) {
      const error = new Error('Role tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let updateRole = await entry.update({
      roleName: req.body.roleName,
      arrAuthorities: req.body.arrAuthorities,
      updatedBy: req.body.updatedBy,
    });
    if (!updateRole) {
      const error = new Error('Update role gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getRoles = await Role.findAll({
      attributes: ['id', 'roleName', 'arrAuthorities'],
    });
    const getUser = await User.findByPk(req.body.updatedBy);
    res.status(200).json({
      message: 'ok',
      role: updateRole,
      arrAuth: getRoles,
      user: getUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
