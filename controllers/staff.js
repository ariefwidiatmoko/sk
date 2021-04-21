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
// url: /localhost:3000/api/staffs method: 'POST'
exports.staffsIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'pengurus', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    let fetchData = await Profile.findAndCountAll({
      where: { type: 'Pengurus' },
    });
    if (!fetchData) {
      const error = new Error('Pengurus tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    let countResult = fetchData.count;
    let staffsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      staffs: staffsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/staffs/:staffId method: 'POST'
exports.staffGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'pengurus', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const staffId = req.params.staffId;
    const getStaff = await Profile.findOne({ where: { code: staffId } });
    res.status(200).json({
      message: 'ok',
      staff: getStaff,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/staffs/edit/:staffId method: 'POST'
exports.staffEdit = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'pengurus', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into staff.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const staffId = req.params.staffId;
    const profile = await Profile.findOne({ where: { code: staffId } });
    if (!profile) {
      const error = new Error('Pengurus tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updatedProfile = await profile.update(obj);
    if (!updatedProfile) {
      const error = new Error('Update Pengurus gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getStaff = await Profile.findOne({
      where: { code: staffId },
    });
    res.status(200).json({
      message: 'ok',
      staff: getStaff,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/staffs/photo-upload/:staffId method: 'POST'
exports.staffPhotoUpload = async (req, res, next) => {
  const staffId = req.params.staffId;
  try {
    const checkErr = await authScope(req.userId, 'pengurus', 'u');
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
    const resizeInput = `images/profile/${staffId}/${req.file.filename}`;
    const resizeOutput = `images/profile/${staffId}/${
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
    let profile = await Profile.findOne({ where: { userId: staffId } });
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
      where: { userId: staffId },
    });
    res.status(200).json({
      message: 'ok',
      staff: getProfile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/staffs/photo-delete/:staffId method: 'POST'
exports.staffPhotoDelete = async (req, res, next) => {
  const staffId = req.params.staffId;
  const photo = req.body.photo;
  try {
    const checkErr = await authScope(req.userId, 'pengurus', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const staff = await Profile.findOne({ where: { userId: staffId } });
    let filteredPhotos;
    if (!staff) {
      const error = new Error('Pengurus tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    filteredPhotos = staff.photos.split(',').filter((itemPhoto) => {
      return itemPhoto !== photo;
    });
    clearImage(photo);
    const staffPhoto = {
      photos: filteredPhotos.toString(),
      updatedBy: req.userId,
    };
    const updateStaff = await staff.update(staffPhoto);
    if (!updateStaff) {
      const error = new Error('Gagal menghapus foto!');
      error.statusCode = 404;
      return next(error);
    }
    const getStaff = await Profile.findOne({
      where: { userId: staffId },
    });
    res.status(200).json({
      message: 'ok',
      staff: getStaff,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/staffs/set/:staffId method: 'POST'
exports.staffSet = async (req, res, next) => {
  const setType = req.body.setType;
  console.log(setType);
  try {
    const checkErr = await authScope(req.userId, 'pengurus', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    const staffId = req.params.staffId;
    const profile = await Profile.findOne({ where: { code: staffId } });
    if (!profile) {
      const error = new Error('Update pengurus gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const type = setType === 'Pengurus' ? 'Pengurus' : 'Anggota';
    const updatedProfile = await profile.update({type: type});
    if (!updatedProfile) {
      const error = new Error('Update pengurus gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getStaff = await Profile.findOne({
      where: { code: staffId },
    });
    res.status(200).json({
      message: 'ok',
      staff: getStaff,
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
