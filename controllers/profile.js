const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { validationResult } = require('express-validator/check');
// url: /localhost:3000/api/profile/:userId method: 'GET'
exports.profileGet = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (req.userId + '' !== userId + '') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: userId },
      include: [{ model: Profile }],
    });
    if (!getUser) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      user: getUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/profile/edit/:userId method: 'POST'
exports.profileEdit = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (req.userId + '' !== userId + '') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    // change req.body into object to pass into profile.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const profile = await Profile.findOne({ where: { userId: userId } });
    if (!profile) {
      const error = new Error('User tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const fieldsToExclude = ['id', 'type', 'code', 'activeStatus', 'name', 'fullname', 'joinDate', 'pob', 'dob', 'email', 'phone', 'address', 'gender'];
    const updateFields = Object.keys(Profile.rawAttributes).filter(s => !fieldsToExclude.includes(s));

    const updatedProfile = await profile.update(obj, {fields: updateFields});
    if (!updatedProfile) {
      const error = new Error('Update profil gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: updatedProfile.userId },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/profile/picture-upload/:userId method: 'POST'
exports.profilePictureUpload = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (req.userId + '' !== userId + '') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validasi gagal!');
      error.statusCode = 422;
      return next(error);
    }
    if (!req.file) {
      const error = new Error('Foto tidak dapat diproses.');
      error.statusCode = 422;
      return next(error);
    }
    const filteredFilename = `images/profile/${userId}/${
      req.file.filename
    }_${req.body.filename.replace(',', '')}`;
    const moveFile = await fse.move(req.file.path, filteredFilename);
    if (moveFile) {
      console.log('File berhasil dipindahkan!');
    }
    let profile = await Profile.findOne({ where: { userId: userId } });
    if (!profile) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      return next(error);
    }
    const newPhotos = profile.photos
      ? profile.photos + ',' + filteredFilename
      : filteredFilename;
    const profilePic = {
      mainPhoto: profile.mainPhoto ? profile.mainPhoto : filteredFilename,
      photos: newPhotos.toString(),
    };
    const updatedProfile = await profile.update(profilePic);
    if (!updatedProfile) {
      const error = new Error('Update foto profil gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getProfile = await Profile.findOne({
      where: { userId: userId },
    });
    res.status(200).json({
      message: 'ok',
      profile: getProfile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/profile/photo-delete/:userId method: 'POST'
exports.profilePhotoDelete = async (req, res, next) => {
  const userId = req.params.userId;
  const photo = req.body.photo;
  try {
    if (req.userId + '' !== userId + '') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validasi gagal!');
      error.statusCode = 422;
      return next(error);
    }
    const profile = await Profile.findOne({ where: { userId: userId } });
    let filteredPhotos;
    if (!profile) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      return next(error);
    }
    filteredPhotos = profile.photos.split(',').filter((itemPhoto) => {
      return itemPhoto !== photo;
    });
    clearImage(photo);
    const profilePhoto = {
      photos: filteredPhotos.toString(),
    };
    const updateProfile = await profile.update(profilePhoto);
    if (!updateProfile) {
      const error = new Error('Hapus foto profil gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getProfile = await Profile.findOne({
      where: { userId: updateProfile.userId },
    });
    res.status(200).json({
      message: 'ok',
      profile: getProfile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/profile/password-reset/:userId method: 'POST'
exports.profilePasswordReset = async (req, res, next) => {
  const userId = req.params.userId;
  const password = req.body.password;
  const updatedBy = req.body.updatedBy;
  try {
    if (req.userId + '' !== userId + '') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const hashPass = await bcrypt.hash(password, 12);
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      return next(error);
    }
    const updatedUser = await user.update({
      password: hashPass,
      updatedBy: updatedBy,
    });
    if (!updatedUser) {
      const error = new Error('Reset password gagal');
      error.statusCode = 404;
      return next(error);
    }
    let getUser = await User.scope('withoutPassword').findOne({
      where: { id: updatedUser.id },
      include: [{ model: Profile }],
    });
    res.status(200).json({
      message: 'ok',
      user: getUser,
      profile: getUser.profile,
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
