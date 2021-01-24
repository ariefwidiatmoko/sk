const Profile = require('../models/profile');
const Reception = require('../models/reception');
const Transaction = require('../models/transaction');
const Recyclebin = require('../models/recyclebin');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { validationResult } = require('express-validator/check');
// url: /localhost:3000/api/receptions method: 'POST'
exports.receptionsGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'penerimaan', 'v');
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
      order: [['createdAt', 'DESC']],
    };
    if (search && search === 'deleted') {
      query.where = { deletedAt: { [Op.ne]: null } };
    } else if (search) {
      query.where = {
        [Op.and]: [
          { deletedAt: { [Op.is]: null } },
          {
            [Op.or]: [
              { code: { [Op.substring]: search } },
              { accountCode: { [Op.substring]: search } },
              { name: { [Op.substring]: search } },
              { type: { [Op.substring]: search } },
            ],
          },
        ],
      };
    }
    const fetchData = await Reception.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const receptionsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      receptions: receptionsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/receptions/create method: 'POST'
exports.receptionCreate = async (req, res, next) => {
  const code = req.body.code;
  const date = req.body.date;
  const accountCode = req.body.accountCode;
  const accountName = req.body.accountName;
  const name = req.body.name !== 'undefined' ? req.body.name : accountName;
  const type = req.body.type !== 'undefined' ? req.body.type : null;
  const sum = req.body.sum;
  const unit = req.body.unit;
  const total = req.body.total;
  const remarks = req.body.remarks !== 'undefined' ? req.body.remarks : null;
  const createdBy = req.body.userId;
  const userId = req.userId;
  try {
    const checkErr = await authScope(req.userId, 'penerimaan', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Reception.findOne({
      where: { receptionCode: receptionCode },
    });
    if (entry) {
      const error = new Error('Kode sudah digunakan!');
      error.statusCode = 422;
      return next(error);
    }
    const accountCheck = Transaction.findOne({
      where: { code: accountCode },
    });
    if (!accountCheck) {
      const error = new Error('Akun tidak ditemukan!');
      error.statusCode = 422;
      return next(error);
    }
    const dataReception = new Reception(
      {
        code: code,
        date: date,
        accountCode: accountCode,
        name: name,
        type: type,
        sum: sum,
        unit: unit,
        total: total,
        remarks: remarks,
        createdBy: createdBy,
        userId: userId,
      },
      { omitNull: true }
    );
    const newReception = await dataReception.save();
    const dataTransaction = new Transaction({
      transactionCode: transactionCode,
      date: date,
      accountCode: accountCheck.code,
      accountName: accountCheck.name,
      accountType: accountCheck.type,
      headerDetail: accountCheck.headerDetail,
      accountLevel: accountCheck.level,
      transactionSum: receptionSum,
      receptionId: newReception.id,
      userId: userId,
    });
    await dataTransaction.save();
    const getReception = await Reception.findOne({
      where: { id: newReception.id },
    });
    res.status(201).json({
      message: 'ok',
      reception: getReception,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/receptions/update/:receptionId method: 'POST'
exports.receptionUpdate = async (req, res, next) => {
  const receptionId = req.params.receptionId;
  const date = req.body.date;
  const accountCode =
    req.body.accountCode !== 'null' ? req.body.accountCode : null;
  const type = req.body.type !== 'null' ? req.body.type : null;
  const name = req.body.name !== 'null' ? req.body.name : null;
  const sum = req.body.sum !== 'null' ? req.body.sum : null;
  const unit = req.body.unit !== 'null' ? req.body.unit : null;
  const total = req.body.total !== 'null' ? req.body.total : null;
  const remarks = req.body.remarks !== 'null' ? req.body.remarks : null;
  const updatedBy = req.userId;
  try {
    const checkErr = await authScope(req.userId, 'penerimaan', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    let entry = await Reception.findOne({
      where: { code: receptionId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let updateEntry = await entry.update(
      {
        date: date,
        accountCode: accountCode,
        type: type,
        name: name,
        sum: sum,
        unit: unit,
        total: total,
        remarks: remarks,
        updatedBy: updatedBy,
        updatedAt: new Date().toISOString(),
      },
      { omitNull: false }
    );
    if (!updateEntry) {
      const error = new Error('Update data gagal!');
      error.statusCode = 404;
      return next(error);
    }
    getEntry = await Reception.findOne({
      where: { id: updateEntry.id },
    });
    res.status(200).json({
      message: 'ok',
      reception: getEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/receptions/delete/:receptionId method: 'POST
exports.receptionDelete = async (req, res, next) => {
  const receptionId = req.params.receptionId;
  try {
    const checkErr = await authScope(req.userId, 'penerimaan', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Reception.findOne({
      where: { id: receptionId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updateEntry = await entry.update({
      deletedAt: new Date().toISOString(),
      deletedBy: req.userId,
    });
    res.status(200).json({
      message: 'ok',
      reception: { id: updateEntry.id, code: updateEntry.code },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/receptions/restore/:receptionId method: 'POST
exports.receptionRestore = async (req, res, next) => {
  const receptionId = req.params.receptionId;
  try {
    const checkErr = await authScope(req.userId, 'penerimaan', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Saving.findOne({
      where: { id: receptionId },
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
      reception: { id: updateEntry.id, code: updateEntry.code },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/receptions/hard-delete/:receptionId method: 'POST
exports.receptionHardDel = async (req, res, next) => {
  const receptionId = req.params.receptionId;
  try {
    const checkErr = await authScope(req.userId, 'penerimaan', 'h');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Saving.findOne({
      where: { id: savingId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const data = JSON.stringify(entry.toJSON());
    const dataRecyclebin = new Recyclebin({
      itemId: entry.id,
      name: entry.code,
      category: 'Penerimaan',
      data: data,
      deletedBy: req.userId,
      userId: req.userId,
    });
    const newRecyclebin = await dataRecyclebin.save();
    if (!newRecyclebin) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    const checkDelete = entry.destroy();
    if (!checkDelete) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      reception: { id: newRecyclebin.itemId, name: newRecyclebin.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
