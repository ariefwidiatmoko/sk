const Profile = require('../models/profile');
const Loan = require('../models/loan');
const Recyclebin = require('../models/recyclebin');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { validationResult } = require('express-validator/check');
const { update } = require('../models/profile');
// url: /localhost:3000/api/loans method: 'POST'
exports.loansGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'pinjaman', 'v');
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
      include: [
        {
          model: Profile,
          attributes: [
            'code',
            'name',
            'address',
            'phone',
            'email',
            'mainPhoto',
            'joinDate',
          ],
        },
      ],
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
              { '$Profile.code$': { [Op.substring]: search } },
              { '$Profile.name$': { [Op.substring]: search } },
            ],
          },
        ],
      };
    }
    const fetchData = await Loan.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const loansResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      loans: loansResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/loans/create method: 'POST'
exports.loanCreate = async (req, res, next) => {
  const userId = req.userId;
  const code = req.body.code;
  const sum = req.body.sum;
  const month = req.body.month;
  const interest = req.body.interest;
  const fees = req.body.fees;
  const primary = req.body.primary !== 'undefined' ? req.body.primary : null;
  const total = req.body.total;
  const installment = req.body.installment;
  const installmentFix = req.body.installmentFix;
  const date = req.body.date;
  const remarks = req.body.remarks !== 'undefined' ? req.body.remarks : null;
  const profileId = req.body.profileId;
  try {
    const checkErr = await authScope(userId, 'pinjaman', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const checkEntry = await Loan.findOne({
      where: { code: code },
    });
    if (checkEntry) {
      const error = new Error('Kode sudah digunakan!');
      error.statusCode = 422;
      return next(error);
    }
    const data = new Loan(
      {
        code: code,
        date: date,
        sum: sum,
        month: month,
        interest: interest,
        fees: fees,
        primary: primary,
        total: total,
        installment: installment,
        installmentFix: installmentFix,
        remarks: remarks,
        profileId: profileId,
        createdBy: userId,
        userId: userId,
      },
      { omitNull: true }
    );
    const newEntry = await data.save();
    const getEntry = await Loan.findOne({
      where: { id: newEntry.id },
      include: [
        {
          model: Profile,
          attributes: [
            'id',
            'code',
            'name',
            'address',
            'email',
            'phone',
            'mainPhoto',
          ],
        },
      ],
    });
    res.status(201).json({
      message: 'ok',
      loan: getEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/loans/update/:loanId method: 'POST'
exports.loanUpdate = async (req, res, next) => {
  const loanId = req.params.loanId;
  const updatedBy = req.userId;
  try {
    const checkErr = await authScope(req.userId, 'pinjaman', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    let entry = await Loan.findOne({
      where: { code: loanId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let updateEntry = await entry.update(
      {
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
    getEntry = await Loan.findOne({
      where: { id: updateEntry.id },
      include: [
        {
          model: Profile,
          attributes: [
            'id',
            'code',
            'name',
            'address',
            'email',
            'phone',
            'mainPhoto',
          ],
        },
      ],
    });
    res.status(200).json({
      message: 'ok',
      loan: getEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/loans/delete/:loanId method: 'POST
exports.loanDelete = async (req, res, next) => {
  const loanId = req.params.loanId;
  try {
    const checkErr = await authScope(req.userId, 'pinjaman', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { id: loanId },
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
      loan: { id: updateEntry.id, loanCode: updateEntry.loanCode },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/loans/restore/:loanId method: 'POST
exports.loanRestore = async (req, res, next) => {
  const loanId = req.params.loanId;
  try {
    const checkErr = await authScope(req.userId, 'pinjaman', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { id: loanId },
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
      loan: { id: updateEntry.id, code: updateEntry.code },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/loans/hard-delete/:loanId method: 'POST
exports.loanHardDel = async (req, res, next) => {
  const loanId = req.params.loanId;
  try {
    const checkErr = await authScope(req.userId, 'pinjaman', 'h');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { id: loanId },
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
      category: 'pinjaman',
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
      loan: { id: newRecyclebin.itemId, name: newRecyclebin.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
