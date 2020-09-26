const Session = require('../models/sessionjwt');
const User = require('../models/user');
const Profile = require('../models/profile');
const Role = require('../models/role');
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
      const error = new Error(`You're not authorized!`);
      error.statusCode = 401;
      return next(error);
    }
    const getUser = await User.scope('withoutPassword').findOne({
      where: { id: userId },
      include: [{ model: Profile }],
    });
    if (!getUser) {
      const error = new Error('User could not be found!');
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
      const error = new Error(`You're not authorized!`);
      error.statusCode = 401;
      return next(error);
    }
    // change req.body into object to pass into profile.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const profile = await Profile.findOne({ where: { userId: userId } });
    if (!profile) {
      const error = new Error('User could not be found!');
      error.statusCode = 404;
      return next(error);
    }

    // const fieldsToExclude = ['password', 'sensitive_info', 'attribute_not_allowed_due_to_user_role']    
    // const myFields = Object.keys(MyModel.rawAttributes).filter( s => !fildsToExclude.includes(s))
    // MyModel.update(newValue, {fields: myFields})
    const fieldsToExclude = ['id', 'profileType', 'code', 'activeStatus', 'name', 'fullname', 'joinDate', 'pob', 'dob', 'email', 'phone', 'address', 'gender'];
    const updateFields = Object.keys(Profile.rawAttributes).filter(s => !fieldsToExclude.includes(s));

    const updatedProfile = await profile.update(obj, {fields: updateFields});
    if (!updatedProfile) {
      const error = new Error('Update profile failed!');
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
      const error = new Error(`You're not authorized!`);
      error.statusCode = 401;
      return next(error);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed!');
      error.statusCode = 422;
      return next(error);
    }
    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      return next(error);
    }
    const filteredFilename = `images/profile/${userId}/${
      req.file.filename
    }_${req.body.filename.replace(',', '')}`;
    const moveFile = await fse.move(req.file.path, filteredFilename);
    if (moveFile) {
      console.log('File successfully moved!');
    }
    let profile = await Profile.findOne({ where: { userId: userId } });
    if (!profile) {
      const error = new Error('User could not be found');
      error.statusCode = 404;
      return next(error);
    }
    const newPhotos = profile.arrPhotos
      ? profile.arrPhotos + ',' + filteredFilename
      : filteredFilename;
    const profilePic = {
      mainPhoto: profile.mainPhoto ? profile.mainPhoto : filteredFilename,
      arrPhotos: newPhotos.toString(),
    };
    const updatedProfile = await profile.update(profilePic);
    if (!updatedProfile) {
      const error = new Error('Update profile picture failed!');
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
// url: /localhost:3000/api/profile/picture-delete/:userId method: 'POST'
exports.profilePictureDelete = async (req, res, next) => {
  const userId = req.params.userId;
  const photo = req.body.photo;
  try {
    if (req.userId + '' !== userId + '') {
      const error = new Error(`You're not authorized!`);
      error.statusCode = 401;
      return next(error);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed!');
      error.statusCode = 422;
      return next(error);
    }
    const profile = await Profile.findOne({ where: { userId: userId } });
    let filteredPhotos;
    if (!profile) {
      const error = new Error('User could not be found');
      error.statusCode = 404;
      return next(error);
    }
    filteredPhotos = profile.photos.split(',').filter((photo) => {
      return photo !== photo;
    });
    clearImage(photo);
    const profilePic = {
      arrPhotos: filteredPhotos.toString(),
    };
    const updateProfile = await profile.update(profilePic);
    if (!updateProfile) {
      const error = new Error('Delete profile picture failed!');
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
      const error = new Error(`You're not authorized!`);
      error.statusCode = 401;
      return next(error);
    }
    const hashPass = await bcrypt.hash(password, 12);
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User could not be found');
      error.statusCode = 404;
      return next(error);
    }
    const updatedUser = await user.update({
      password: hashPass,
      updatedBy: updatedBy,
    });
    if (!updatedUser) {
      const error = new Error('Reset password failed');
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
