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
// url: /localhost:3000/api/members method: 'POST'
exports.membersIndex = async (req, res, next) => {
  try {
    const userId = req.userId;
    const checkErr = await authScope(userId, 'anggota', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const number = parseInt(req.body.number);
    const page = parseInt(req.body.page);
    const search = req.body.search;
    const query = {
      where: {
        [Op.and]: [
          { type: { [Op.eq]: 'Anggota' } },
          { deletedAt: { [Op.is]: null } },
        ],
      },
      limit: number,
      offset: (page - 1) * number || 0,
      order: [
        ['activeStatus', 'DESC'],
        ['name', 'ASC'],
      ],
      attributes: [
        'id',
        'type',
        'code',
        'name',
        'fullname',
        'activeStatus',
        'joinDate',
        'email',
        'address',
        'phone',
        'mainPhoto',
        'deletedAt',
      ],
    };
    if (search && search === 'deleted') {
      query.where = {
        [Op.and]: [
          { type: { [Op.eq]: 'Anggota' } },
          { deletedAt: { [Op.ne]: null } },
        ],
      };
    } else if (search) {
      query.where = {
        [Op.and]: [
          { type: { [Op.eq]: 'Anggota' } },
          { deletedAt: { [Op.is]: null } },
          {
            [Op.or]: [
              { code: { [Op.substring]: search } },
              { name: { [Op.substring]: search } },
              { fullname: { [Op.substring]: search } },
            ],
          },
        ],
      };
    }
    const fetchData = await Profile.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Anggota tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const membersResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      total: countResult,
      members: membersResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/create method: 'POST'
exports.memberCreate = async (req, res, next) => {
  const code = req.body.code;
  const name = req.body.name;
  const password = name;
  const userId = req.userId;
  const joinDate = req.body.joinDate;
  const fullname = req.body.fullname;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const pob = req.body.pob;
  const dob = req.body.dob;
  const religion = req.body.religion;
  const religionDetail = req.body.religionDetail;
  const activeStatus = true;
  const maritalStatus = req.body.maritalStatus;
  const occupation = req.body.occupation;
  const address = req.body.address;
  const createdBy = userId;
  try {
    const checkErr = await authScope(userId, 'anggota', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const checkUsername = await User.findOne({ where: { username: code } });
    if (checkUsername) {
      const error = new Error('No Anggota sudah digunakan!');
      error.statusCode = 422;
      return next(error);
    }
    const hashPass = await bcrypt.hash(password, 12);
    const data = new User({
      username: code,
      password: hashPass,
      createdBy: createdBy,
    });
    const newUser = await data.save();
    const profile = new Profile({
      type: 'Anggota',
      code: code,
      name: name,
      fullname: fullname,
      joinDate: joinDate,
      phone: phone,
      gender: gender,
      pob: pob,
      dob: dob,
      religion: religion,
      religionDetail: religionDetail,
      activeStatus: activeStatus,
      maritalStatus: maritalStatus,
      occupation: occupation,
      address: address,
      userId: newUser.id,
      createdBy: createdBy,
    });
    const newProfile = await profile.save();
    if (!newUser || !newProfile) {
      const error = new Error('Gagal membuat anggota baru!');
      error.statusCode = 404;
      return next(error);
    }
    const getMember = await Profile.findOne({
      where: { userId: newProfile.userId },
    });
    res.status(201).json({
      message: 'ok',
      member: getMember,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/:memberId method: 'GET'
exports.memberGet = async (req, res, next) => {
  const memberId = req.params.memberId;
  try {
    const checkErr = await authScope(req.userId, 'anggota', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const getMember = await Profile.findOne({
      where: { code: memberId },
    });
    if (!getMember) {
      const error = new Error('Anggota tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      member: getMember,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/edit/:memberId method: 'POST'
exports.memberEdit = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'anggota', 'u');
    if (checkErr) {
      return next(checkErr);
    }
    // change req.body into object to pass into member.update()
    const obj = JSON.parse(JSON.stringify(req.body));
    const memberId = req.params.memberId;
    const profile = await Profile.findOne({ where: { code: memberId } });
    if (!profile) {
      const error = new Error('Anggota tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const updatedProfile = await profile.update(obj);
    if (!updatedProfile) {
      const error = new Error('Update anggota gagal!');
      error.statusCode = 404;
      return next(error);
    }
    const getMember = await Profile.findOne({
      where: { code: memberId },
    });
    res.status(200).json({
      message: 'ok',
      member: getMember,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/photo-upload/:memberId method: 'POST'
exports.memberPhotoUpload = async (req, res, next) => {
  const memberId = req.params.memberId;
  try {
    const checkErr = await authScope(req.userId, 'anggota', 'u');
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
    const resizeInput = `images/profile/${memberId}/${req.file.filename}`;
    const resizeOutput = `images/profile/${memberId}/${
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
    let profile = await Profile.findOne({ where: { userId: memberId } });
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
      where: { userId: memberId },
    });
    res.status(200).json({
      message: 'ok',
      member: getProfile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/photo-delete/:memberId method: 'POST'
exports.memberPhotoDelete = async (req, res, next) => {
  const memberId = req.params.memberId;
  const photo = req.body.photo;
  try {
    const checkErr = await authScope(req.userId, 'anggota', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const member = await Profile.findOne({ where: { userId: memberId } });
    let filteredPhotos;
    if (!member) {
      const error = new Error('Anggota tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    filteredPhotos = member.photos.split(',').filter((itemPhoto) => {
      return itemPhoto !== photo;
    });
    clearImage(photo);
    const memberPhoto = {
      photos: filteredPhotos.toString(),
      updatedBy: req.userId,
    };
    const updateMember = await member.update(memberPhoto);
    if (!updateMember) {
      const error = new Error('Gagal menghapus foto!');
      error.statusCode = 404;
      return next(error);
    }
    const getMember = await Profile.findOne({
      where: { userId: updateMember.userId },
    });
    res.status(200).json({
      message: 'ok',
      member: getMember,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/delete/:memberId method: 'POST
exports.memberDelete = async (req, res, next) => {
  const memberId = req.params.memberId;
  try {
    const checkErr = await authScope(req.userId, 'anggota', 'd');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findOne({
      where: { id: memberId },
    });
    const entryProfile = await Profile.findOne({
      where: { userId: memberId },
    });
    if (!entry) {
      const error = new Error('Anggota tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (entry.roles === 'SA') {
      const error = new Error(`kamu tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const updateEntry = await entry.update({
      deletedAt: new Date().toISOString(),
      deletedBy: req.userId,
    });
    const updateEntryProfile = await entryProfile.update({
      deletedAt: new Date().toISOString(),
      deletedBy: req.userId,
    });
    res.status(200).json({
      message: 'ok',
      member: {
        id: updateEntry.id,
        code: updateEntryProfile.code,
        name: updateEntryProfile.name,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/restore/:memberId method: 'POST
exports.memberRestore = async (req, res, next) => {
  const memberId = req.params.memberId;
  try {
    const checkErr = await authScope(req.userId, 'anggota', 'r');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findOne({
      where: { id: memberId },
    });
    const entryProfile = await Profile.findOne({
      where: { userId: memberId },
    });
    if (!entry) {
      const error = new Error('Anggota tidak ditemukan!');
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
    const updateEntryProfile = await entryProfile.update(
      {
        deletedAt: null,
        deletedBy: null,
      },
      { omitNull: false }
    );
    res.status(200).json({
      message: 'ok',
      member: {
        id: updateEntry.id,
        code: updateEntryProfile.code,
        name: updateEntryProfile.name,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/hard-delete/:memberId method: 'POST
exports.memberHardDel = async (req, res, next) => {
  const memberId = req.params.memberId;
  const authId = req.userId;
  try {
    const checkErr = await authScope(authId, 'anggota', 'h');
    if (checkErr) {
      return next(checkErr);
    }
    const entry = await User.findOne({
      where: { id: memberId },
      include: [{ model: Profile }],
    });
    const entryProfile = await Profile.findOne({
      where: { userId: memberId },
    });
    if (!entry) {
      const error = new Error('Anggota tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    if (entry.roles === 'SA') {
      const error = new Error(`Anda tidak memiliki otoritas!`);
      error.statusCode = 401;
      return next(error);
    }
    const data = JSON.stringify(entry.toJSON());
    const dataRecyclebin = new Recyclebin({
      itemId: entry.id,
      name: entry.profile.name,
      category: 'User',
      data: data,
      deletedBy: req.userId,
      userId: req.userId,
    });
    const newRecyclebin = await dataRecyclebin.save();
    if (!newRecyclebin) {
      const error = new Error('Gagal menghapus Anggota!');
      error.statusCode = 404;
      return next(error);
    }
    const deletedEntry = entry.destroy();
    entryProfile.destroy();
    if (!deletedEntry) {
      const error = new Error('Gagal menghapus Anggota!');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'ok',
      userId: { id: newRecyclebin.itemId },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// // url: /localhost:3000/api/members/import method: 'POST'
exports.membersImport = async (req, res, next) => {
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'anggota', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const members = JSON.parse(req.body.members);
    const logs = req.body.logs;
    let membersError = [];
    let membersSuccess = [];
    const newDate = new Date();
    const year = newDate.getFullYear() + '';
    const yy = year.slice(2, 4);
    const month = newDate.getMonth() + 1 + '';
    const mm = month.length > 1 ? month : 0 + month;
    for (let i = 0; i < members.length; i++) {
      let ID = customAlphabet(NUM_ALPHABET, 5);
      let code = yy + mm + '-' + ID();
      let usernameData = code;
      let nameData = members[i].Panggilan;
      let passwordData = members[i].Password + '';
      const checkUsername = await User.findOne({
        where: { username: usernameData },
      });
      if (checkUsername) {
        membersError.push(nameData);
      } else {
        const hashPass = await bcrypt.hash(passwordData, 12);
        const data = new User({
          username: usernameData,
          password: hashPass,
          logs: logs,
        });
        const newUser = await data.save();
        const profile = new Profile({
          type: 'Anggota',
          code: usernameData,
          name: nameData,
          fullname: members[i].Nama_Lengkap,
          phone: members[i].No_Telpon,
          gender: members[i].Jenis_Kelamin === 'L' ? 'male' : 'female',
          pob: members[i].Tempat_Lahir,
          dob: new Date(
            (members[i].Tanggal_Lahir - (25567 + 2)) * 86400 * 1000
          ).toISOString(),
          religion: members[i].Agama,
          maritalStatus: members[i].Status_Kawin,
          occupation: members[i].Pekerjaan,
          address: members[i].Alamat,
          activeStatus: true,
          joinDate: new Date().toISOString(),
          userId: newUser.id,
          logs: logs,
        });
        await profile.save();
        membersSuccess.push(nameData);
      }
    }
    res.status(201).json({
      message: 'ok',
      membersSuccess: membersSuccess,
      membersError: membersError,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

function clearImage(filePath) {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (error) => console.log(error));
}
