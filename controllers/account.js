const User = require('../models/user');
const Account = require('../models/account');
const Recyclebin = require('../models/recyclebin');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { validationResult } = require('express-validator/check');
// url: /localhost:3000/api/members method: 'POST'
exports.accountsGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'akun', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const search = req.body.search;
    const query = {
      order: [['code', 'ASC']],
    };
    if (search && search === 'deleted') {
      query.where = { deletedAt: { [Op.ne]: null } };
    } else if (search) {
      query.where = {
        [Op.or]: [
          { code: { [Op.substring]: search } },
          { name: { [Op.substring]: search } },
        ],
      };
    }
    const fetchData = await Account.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const accountsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      accounts: accountsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// // url: /localhost:3000/api/accounts/create method: 'POST'
exports.accountCreate = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'akun', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into member.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    obj.createdBy = req.userId;
    const entry = await Account.findOne({ where: { code: obj.code } });
    if (entry) {
      const error = new Error('Kode sudah digunakan!');
      error.statusCode = 422;
      return next(error);
    }
    const data = new Account(obj);
    const newEntry = await data.save();
    if (!newEntry) {
      const error = new Error('Gagal membuat data baru!');
      error.statusCode = 404;
      return next(error);
    }
    const getNewEntry = await Account.findOne({
      where: { id: newEntry.id },
    });
    res.status(201).json({
      message: 'ok',
      account: getNewEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/accounts/update/:accountId method: 'POST'
exports.accountUpdate = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'akun', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into member.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    obj.updatedBy = req.userId;
    const accountId = req.params.accountId;
    const entry = await Account.findOne({ where: { id: accountId } });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updateEntry = await entry.update(obj, { omitNull: true });
    if (!updateEntry) {
      const error = new Error('Update data gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const updatedEntry = await Account.findOne({
      where: { id: accountId },
    });
    res.status(200).json({
      message: 'ok',
      account: updatedEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/accounts/delete/:accountId method: 'POST
exports.accountDelete = async (req, res, next) => {
  const userId = req.userId;
  const accountId = req.params.accountId;
  try {
    const checkErr = await authScope(userId, 'akun', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Account.findOne({
      where: { id: accountId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updateEntry = await entry.update({
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
    });
    res.status(200).json({
      message: 'ok',
      account: {
        id: updateEntry.id,
        code: updateEntry.code + ' - ' + updateEntry.name,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/accounts/restore/:accountId method: 'POST
exports.accountRestore = async (req, res, next) => {
  const userId = req.userId;
  const accountId = req.params.accountId;
  try {
    const checkErr = await authScope(userId, 'akun', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Account.findOne({
      where: { id: accountId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updateEntry = await entry.update(
      {
        deletedAt: null,
        deletedBy: null,
      },
      { omitNull: false }
    );
    res.status(200).json({
      message: 'ok',
      account: {
        id: updateEntry.id,
        code: updateEntry.code + ' - ' + updateEntry.name,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/accounts/hard-delete/:accountId method: 'POST
exports.accountHardDel = async (req, res, next) => {
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'akun', 'h');
    if (checkErr) {
      return next(checkErr);
    }
    const accountId = req.params.accountId;
    const entry = await Account.findOne({
      where: { id: accountId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const data = JSON.stringify(entry.toJSON());
    const deleteEntry = new Recyclebin({
      itemId: entry.id,
      name: `${entry.code} - ${entry.name}`,
      category: 'Akun',
      table: 'Account',
      data: data,
      deletedBy: userId,
      userId: userId,
    });
    const newRecyclebin = await deleteEntry.save();
    if (!newRecyclebin) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    const deletedEntry = entry.destroy();
    if (!deletedEntry) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      account: { id: newRecyclebin.itemId, name: newRecyclebin.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/accounts/import method: 'POST'
exports.accountsImport = async (req, res, next) => {
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'akun', 'i');
    if (checkErr) {
      return next(checkErr);
    }
    const accounts = JSON.parse(req.body.accounts);
    const createdBy = userId;
    let accountsError = [];
    let accountsSuccess = [];
    for (let i = 0; i < accounts.length; i++) {
      let code = accounts[i].Kode;
      let name = accounts[i].Akun;
      const entry = await Account.findOne({
        where: { code: code },
      });
      if (entry) {
        accountsError.push(name);
      } else {
        let headerDetail =
          accounts[i].Header_Detail !== undefined
            ? accounts[i].Header_Detail
            : null;
        let type = accounts[i].Tipe !== undefined ? accounts[i].Tipe : null;
        let level = accounts[i].Level;
        const data = new Account(
          {
            code: code,
            name: name,
            type: type,
            headerDetail: headerDetail,
            level: level,
            createdBy: createdBy,
          },
          { omitNull: false }
        );
        await data.save();
        accountsSuccess.push(name);
      }
    }
    res.status(201).json({
      message: 'ok',
      accountsSuccess: accountsSuccess,
      accountsError: accountsError,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
