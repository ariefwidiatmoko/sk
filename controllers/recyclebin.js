const Recyclebin = require('../models/recyclebin');
const Account = require('../models/account');
const User = require('../models/user');
const Profile = require('../models/profile');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
// url: /localhost:3000/api/recyclebins method: 'POST'
exports.recyclebinsGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'recyclebin', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const number = parseInt(req.body.number);
    const page = parseInt(req.body.page);
    const search = req.body.search;
    const query = {
      limit: number,
      offset: (page - 1) * number || 0,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['username'],
          include: [
            {
              model: Profile,
              attributes: ['name'],
            },
          ],
        },
      ],
    };
    if (search) {
      query.where = {
        [Op.or]: [
          { name: { [Op.substring]: search } },
          { category: { [Op.substring]: search } },
          { data: { [Op.substring]: search } },
          { '$User.username$': { [Op.substring]: search } },
          { '$User.Profile.name$': { [Op.substring]: search } },
        ],
      };
    }
    const fetchData = await Recyclebin.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const recyclebinsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      recyclebins: recyclebinsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/recyclebins/restore/:recyclebinId method: 'POST'
exports.recyclebinRestore = async (req, res, next) => {
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'recyclebin', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const recyclebinId = req.params.recyclebinId;
    const checkEntry = await Recyclebin.findOne({
      where: { id: recyclebinId },
    });
    if (!checkEntry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const tableName = checkEntry.table;
    const restoreEntry = new [tableName].save(checkEntry.data, {
      omitNull: false,
    });
    const saveDat = await restoreEntry.save();
    if (!saveDat) {
      const error = new Error('Gagal merestore data!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      recyclebin: { id: checkEntry.itemId, name: checkEntry.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/recyclebins/delete/:recyclebinId method: 'POST'
exports.recyclebinDelete = async (req, res, next) => {
  const recyclebinId = req.params.recyclebinId;
  try {
    const checkErr = await authScope(req.userId, 'recyclebin', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const checkEntry = await Recyclebin.findOne({
      where: { id: recyclebinId },
    });
    if (!checkEntry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const deleteEntry = checkEntry.destroy();
    if (!deleteEntry) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      recyclebin: { id: checkEntry.itemId, name: checkEntry.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
