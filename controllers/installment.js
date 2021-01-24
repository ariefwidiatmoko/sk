const Profile = require('../models/profile');
const Installment = require('../models/installment');
const Loan = require('../models/loan');
const Recyclebin = require('../models/recyclebin');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { validationResult } = require('express-validator/check');
const { update } = require('../models/profile');
// url: /localhost:3000/api/installments method: 'POST'
exports.installmentsGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'angsuran', 'v');
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
      installments: loansResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/installments/:installmentId method: 'POST'
exports.installmentGet = async (req, res, next) => {
  const installmentId = req.params.installmentId;
  try {
    const checkErr = await authScope(req.userId, 'angsuran', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { code: installmentId },
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
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      installment: entry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/installments/create method: 'POST'
exports.installmentCreate = async (req, res, next) => {
  const loanId = req.body.loanId;
  const total = Number(req.body.total);
  const code = req.body.code;
  const date = req.body.date;
  const sum =
    req.body.sum !== 'null' ? req.body.sum : null;
  const num =
    req.body.num !== 'null' ? req.body.num : null;
  const remarks = req.body.remarks !== 'undefined' ? req.body.remarks : null;
  const createdBy = req.body.createdBy;
  const profileId = req.body.profileId;
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'angsuran', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { id: loanId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 422;
      return next(error);
    }
    const obj = {
      code: code,
      sum: sum,
      num: num,
      date: date,
      remarks: remarks,
      createdBy: createdBy,
      loanId: loanId,
      userId: userId,
    };
    const data = new Installment(obj, { omitNull: true });
    await data.save();
    const paid =
      entry.paid !== null
        ? Number(entry.paid) + Number(sum)
        : Number(sum);
    const payment = JSON.parse(entry.payment);
    let newArray;
    if (payment === null) {
      newArray = [obj];
    } else {
      newArray = [...payment, obj];
    }
    const left = Number(total) - paid;
    const updateEntry = await entry.update({
      paid: paid,
      left: left,
      payment: JSON.stringify(newArray),
    });
    if (!updateEntry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 422;
      return next(error);
    }
    const getEntry = await Loan.findOne({
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
    res.status(201).json({
      message: 'ok',
      installment: getEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/installments/update/:installmentId method: 'POST'
exports.installmentUpdate = async (req, res, next) => {
  const installmentId = req.params.installmentId;
  const date = req.body.date;
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'angsuran', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    let entry = await Loan.findOne({
      where: { code: installmentId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let updateEntry = await entry.update(
      {
        date: date,
        updatedBy: userId,
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
      saving: getEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/installments/delete/:installmentId method: 'POST
exports.installmentDelete = async (req, res, next) => {
  const installmentId = req.params.installmentId;
  const userId = req.userId
  try {
    const checkErr = await authScope(userId, 'angsuran', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { id: installmentId },
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
      saving: { id: updateEntry.id, code: updateEntry.code },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/installments/restore/:installmentId method: 'POST
exports.installmentRestore = async (req, res, next) => {
  const installmentId = req.params.installmentId;
  try {
    const checkErr = await authScope(req.userId, 'angsuran', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Loan.findOne({
      where: { id: installmentId },
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
      saving: { id: updateEntry.id, code: updateEntry.code },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/installments/hard-delete/:installmentId method: 'POST
exports.installmentHardDel = async (req, res, next) => {
  const installmentId = req.params.installmentId;
  const userId = req.userId
  try {
    const checkErr = await authScope(userId, 'simpanan', 'h');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Saving.findOne({
      where: { id: installmentId },
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
      category: 'Angsuran',
      data: data,
      deletedBy: req.userId,
      userId: userId,
    });
    const newRecyclebin = await dataRecyclebin.save();
    if (!newRecyclebin) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    const checkDelete = checkSaving.destroy();
    if (!checkDelete) {
      const error = new Error('Gagal menghapus data!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      saving: { id: newRecyclebin.itemId, name: newRecyclebin.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
