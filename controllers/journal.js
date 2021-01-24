const User = require('../models/user');
const Profile = require('../models/profile');
const Transaction = require('../models/transaction');
const Recyclebin = require('../models/recyclebin');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { validationResult } = require('express-validator/check');
const { update } = require('../models/profile');
// url: /localhost:3000/api/journals method: 'POST'
exports.journalsGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'jurnal', 'v');
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
    if (search && search === 'deleted') {
      query.where = { deletedAt: { [Op.ne]: null } };
    } else if (search) {
      query.where = {
        [Op.and]: [
          { deletedAt: { [Op.is]: null } },
          {
            [Op.or]: [{ code: { [Op.substring]: search } }],
          },
        ],
      };
    }
    const fetchData = await Transaction.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const journalsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      journals: journalsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/savings/create method: 'POST'
exports.journalCreate = async (req, res, next) => {
  const userId = req.userId;
  const code = req.body.code;
  const date = req.body.date;
  const debit = req.body.debit;
  const credit = req.body.credit;
  const remarks = req.body.remarks !== undefined ? req.body.remarks : null;
  const createdBy = userId;
  try {
    const checkErr = await authScope(userId, 'jurnal', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await Transaction.findOne({
      where: { code: code },
    });
    if (entry) {
      const error = new Error('Kode sudah digunakan!');
      error.statusCode = 422;
      return next(error);
    }
    const data = new Transaction(
      {
        code: code,
        date: date,
        debit: debit,
        credit: credit,
        remarks: remarks,
        createdBy: createdBy,
        userId: userId,
      },
      { omitNull: true }
    );
    const newEntry = await data.save();
    const getEntry = await Transaction.findOne({
      where: { id: newEntry.id },
      include: [
        {
          model: User,
          attributes: ['username'],
          include: {
            model: Profile,
            attributes: ['name'],
          },
        },
      ],
    });
    res.status(201).json({
      message: 'ok',
      journal: getEntry,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/savings/update/:savingId method: 'POST'
exports.journalUpdate = async (req, res, next) => {
  const userId = req.userId;
  const savingId = req.params.savingId;
  const savingPrimary =
    req.body.savingPrimary !== 'null' ? req.body.savingPrimary : null;
  const savingSecondary =
    req.body.savingSecondary !== 'null' ? req.body.savingSecondary : null;
  const savingTertier =
    req.body.savingTertier !== 'null' ? req.body.savingTertier : null;
  const date = req.body.date;
  const updatedBy = userId;
  try {
    const checkErr = await authScope(userId, 'simpanan', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    let entry = await Saving.findOne({
      where: { savingCode: savingId },
    });
    if (!entry) {
      const error = new Error('Data tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let updateEntry = await entry.update(
      {
        savingPrimary: savingPrimary,
        savingSecondary: savingSecondary,
        savingTertier: savingTertier,
        date: date,
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
    getEntry = await Saving.findOne({
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
// url: /localhost:3000/api/savings/delete/:savingId method: 'POST
exports.journalDelete = async (req, res, next) => {
  const userId = req.userId;
  const savingId = req.params.savingId;
  try {
    const checkErr = await authScope(userId, 'simpanan', 'd');
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
    const updateEntry = await entry.update({
      deletedAt: new Date().toISOString(),
      deletedBy: req.userId,
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
// url: /localhost:3000/api/savings/restore/:savingId method: 'POST
exports.journalRestore = async (req, res, next) => {
  const userId = req.userId;
  const savingId = req.params.savingId;
  try {
    const checkErr = await authScope(userId, 'simpanan', 'r');
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
// url: /localhost:3000/api/savings/hard-delete/:savingId method: 'POST
exports.journalHardDel = async (req, res, next) => {
  const userId = req.userId;
  const savingId = req.params.savingId;
  try {
    const checkErr = await authScope(userId, 'simpanan', 'h');
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
      category: 'Simpanan',
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
      saving: { id: newRecyclebin.itemId, name: newRecyclebin.name },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
