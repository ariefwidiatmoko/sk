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
// url: /localhost:3000/api/supervisors method: 'POST'
exports.supervisorsIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    let fetchData = await Profile.findAndCountAll({
      where: { type: 'Pengawas' },
    });
    if (!fetchData) {
      const error = new Error('Pengawas tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let countResult = fetchData.count;
    let supervisorsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      supervisors: supervisorsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/supervisors/:supervisorId method: 'POST'
exports.supervisorGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const supervisorId = req.params.supervisorId;
    const getSupervisor = await Profile.findOne({ where: { code: supervisorId } });
    res.status(200).json({
      message: 'ok',
      supervisor: getSupervisor,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/supervisors/edit/:supervisorId method: 'POST'
exports.supervisorEdit = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into supervisor.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const supervisorId = req.params.supervisorId;
    const profile = await Profile.findOne({ where: { code: supervisorId } });
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
    const getSupervisor = await Profile.findOne({
      where: { code: supervisorId },
    });
    res.status(200).json({
      message: 'ok',
      supervisor: getSupervisor,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/supervisors/photo-upload/:supervisorId method: 'POST'
exports.supervisorPhotoUpload = async (req, res, next) => {
  const supervisorId = req.params.supervisorId;
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
    const resizeInput = `images/profile/${supervisorId}/${req.file.filename}`;
    const resizeOutput = `images/profile/${supervisorId}/${
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
    let profile = await Profile.findOne({ where: { userId: supervisorId } });
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
    const getProfile = await Profile.findOne({
      where: { userId: supervisorId },
    });
    res.status(200).json({
      message: 'ok',
      supervisor: getProfile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/supervisors/photo-delete/:supervisorId method: 'POST'
exports.supervisorPhotoDelete = async (req, res, next) => {
  const supervisorId = req.params.supervisorId;
  const photo = req.body.photo;
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const supervisor = await Profile.findOne({ where: { userId: supervisorId } });
    let filteredPhotos;
    if (!supervisor) {
      const error = new Error('pengawas tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    filteredPhotos = supervisor.photos.split(',').filter((itemPhoto) => {
      return itemPhoto !== photo;
    });
    clearImage(photo);
    const supervisorPhoto = {
      photos: filteredPhotos.toString(),
      updatedBy: req.userId,
    };
    const updateSupervisor = await supervisor.update(supervisorPhoto);
    if (!updateSupervisor) {
      const error = new Error('Gagal menghapus foto!');
      error.statusCode = 404;
      return next(error);
    }
    const getSupervisor = await Profile.findOne({
      where: { userId: supervisorId },
    });
    res.status(200).json({
      message: 'ok',
      supervisor: getSupervisor,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/supervisors/set/:supervisorId method: 'POST'
exports.supervisorSet = async (req, res, next) => {
  const setType = req.body.setType;
  console.log(setType);
  try {
    const checkErr = await authScope(req.userId, 'badan-pengawas', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const supervisorId = req.params.supervisorId;
    const profile = await Profile.findOne({ where: { code: supervisorId } });
    if (!profile) {
      const error = new Error('Update pengawas gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const type = setType === 'Pengawas' ? 'Pengawas' : 'Anggota';
    const updatedProfile = await profile.update({type: type});
    if (!updatedProfile) {
      const error = new Error('Update pengawas gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getSupervisor = await Profile.findOne({
      where: { code: supervisorId },
    });
    res.status(200).json({
      message: 'ok',
      supervisor: getSupervisor,
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
