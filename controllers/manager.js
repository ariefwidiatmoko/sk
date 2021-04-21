const User = require('../models/user');
const Profile = require('../models/profile');
const Recyclebin = require('../models/recyclebin');
const bcrypt = require('bcryptjs');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { validationResult } = require('express-validator/check');
var { customAlphabet } = require('nanoid');
const NUM_ALPHABET = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// url: /localhost:3000/api/managers method: 'POST'
exports.managersIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'ketua', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    let fetchData = await Profile.findAndCountAll({
      where: { type: 'Ketua' },
    });
    if (!fetchData) {
      const error = new Error('Ketua tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let countResult = fetchData.count;
    let managersResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      managers: managersResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/managers/:managerId method: 'POST'
exports.managerGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const managerId = req.params.managerId;
    const managerResult = await Profile.findOne({ where: { code: managerId } });
    res.status(200).json({
      message: 'ok',
      manager: managerResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/managers/edit/:managerId method: 'POST'
exports.managerEdit = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into manager.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const managerId = req.params.managerId;
    const profile = await Profile.findOne({ where: { code: managerId } });
    if (!profile) {
      const error = new Error('pengawas tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updatedProfile = await profile.update(obj);
    if (!updatedProfile) {
      const error = new Error('Update pengawas gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const managerResult = await Profile.findOne({
      where: { code: managerId },
    });
    res.status(200).json({
      message: 'ok',
      manager: managerResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/managers/photo-upload/:managerId method: 'POST'
exports.managerPhotoUpload = async (req, res, next) => {
  const managerId = req.params.managerId;
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validasi gagal!');
      error.statusCode = 422;
      return next(error);
    }
    if (!req.file) {
      const error = new Error('Photo tidak ada.');
      error.statusCode = 422;
      return next(error);
    }
    const resizeInput = `images/profile/${managerId}/${req.file.filename}`;
    const resizeOutput = `images/profile/${managerId}/${
      req.file.filename
    }_${req.body.filename.replace(',', '')}`;
    // move image into profile folder
    const moFile = await fse.move(req.file.path, resizeInput);
    if (moFile) {
      console.log('File successfully moved!');
    }
    // resize file
    const reFile = await sharp(resizeInput)
      .resize({ height: 200, width: 200 })
      .toFile(resizeOutput);
    if (reFile) {
      console.log('File successfully resized!');
      // delete if successfull
      clearImage(resizeInput);
    }
    let profile = await Profile.findOne({ where: { userId: managerId } });
    if (!profile) {
      const error = new Error('Anggota tidak ditemukan');
      error.statusCode = 404;
      return next(error);
    }
    const newPhotos = profile.photos
      ? profile.photos + ',' + resizeOutput
      : resizeOutput;
    const profilePic = {
      mainPhoto: profile.mainPhoto ? profile.mainPhoto : resizeOutput,
      photos: newPhotos.toString(),
    };
    const updatedProfile = await profile.update(profilePic);
    if (!updatedProfile) {
      const error = new Error('Profil foto gagal terupdate!');
      error.statusCode = 404;
      return next(error);
    }
    const managerResult = await Profile.findOne({
      where: { userId: managerId },
    });
    res.status(200).json({
      message: 'ok',
      manager: managerResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/managers/photo-delete/:managerId method: 'POST'
exports.managerPhotoDelete = async (req, res, next) => {
  const managerId = req.params.managerId;
  const photo = req.body.photo;
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const manager = await Profile.findOne({ where: { userId: managerId } });
    let filteredPhotos;
    if (!manager) {
      const error = new Error('pengawas tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    filteredPhotos = manager.photos.split(',').filter((itemPhoto) => {
      return itemPhoto !== photo;
    });
    clearImage(photo);
    const managerPhoto = {
      photos: filteredPhotos.toString(),
      updatedBy: req.userId,
    };
    const managerUpdate = await manager.update(managerPhoto);
    if (!managerUpdate) {
      const error = new Error('Gagal menghapus foto!');
      error.statusCode = 404;
      return next(error);
    }
    const managerResult = await Profile.findOne({
      where: { userId: managerId },
    });
    res.status(200).json({
      message: 'ok',
      manager: managerResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/managers/set/:managerId method: 'POST'
exports.managerSet = async (req, res, next) => {
  const setType = req.body.setType;
  console.log(setType);
  try {
    const checkErr = await authScope(req.userId, 'ketua', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const managerId = req.params.managerId;
    const profile = await Profile.findOne({ where: { code: managerId } });
    if (!profile) {
      const error = new Error('Update ketua gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const type = setType === 'Ketua' ? 'Ketua' : 'Anggota';
    const managerUpdate = await profile.update({type: type});
    if (!managerUpdate) {
      const error = new Error('Update ketua gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const managerResult = await Profile.findOne({
      where: { code: managerId },
    });
    res.status(200).json({
      message: 'ok',
      manager: managerResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (error) => console.log(error));
};
