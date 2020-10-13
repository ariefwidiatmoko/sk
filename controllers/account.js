const User = require('../models/user');
const Account = require('../models/account');
const authScope = require('../middleware/auth-scope');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { validationResult } = require('express-validator/check');
// url: /localhost:3000/api/members method: 'POST'
exports.accountsGet = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'akun', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    const number = parseInt(req.body.number);
    const page = parseInt(req.body.page);
    const search = req.body.search;
    const query = {
      limit: number,
      offset: (page - 1) * number || 0,
      order: [['code', 'ASC']],
    };
    if (search) {
      query.where = {
            [Op.or]: [
              { code: { [Op.substring]: search } },
              { name: { [Op.substring]: search } },
            ],
      };
    }
    const fetchData = await Account.findAndCountAll(query);
    if (!fetchData) {
      const error = new Error('Akun tidak ditemukan!');
      error.statusCode = 404;
      return next(error);
    }
    const countResult = fetchData.count;
    const accountsResult = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      totals: countResult,
      accounts: accountsResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// url: /localhost:3000/api/members/import method: 'POST'
exports.accountsImport = async (req, res, next) => {
  const userId = req.userId;
  try {
    const checkErr = await authScope(userId, 'akun', 'c');
    if (checkErr) {
      return next(checkErr);
    }
    const accounts = JSON.parse(req.body.accounts);
    const createdBy = userId;
    let accountsError = [];
    let accountsSuccess = [];
    for (let i = 0; i < accounts.length; i++) {
      let code = accounts[i].Kode;
      let name = accounts[i].Akun;
      const checkAccount = await Account.findOne({
        where: { code: code },
      });
      if (checkAccount) {
        accountsError.push(name);
      } else {
        let headerDetail = accounts[i].Header_Detail;
        let type = accounts[i].Tipe;
        let level = accounts[i].Level;
        const data = new Account({
          code: code,
          name: name,
          headerDetail: headerDetail,
          type: type,
          level: level,
          createdBy: createdBy,
        });
        const newUser = await data.save();
        const profile = new Profile({
          profileType: 'Anggota',
          code: usernameData,
          name: nameData,
          fullname: members[i].Nama_Lengkap,
          phone: members[i].No_Telpon,
          gender: members[i].Jenis_Kelamin === 'L' ? 'male': 'female',
          pob: members[i].Tempat_Lahir,
          dob: new Date((members[i].Tanggal_Lahir - (25567 + 2))*86400*1000).toISOString(),
          religion: members[i].Agama,
          maritalStatus: members[i].Status_Kawin,
          occupation: members[i].Pekerjaan,
          address: members[i].Alamat,
          activeStatus: true,
          joinDate: new Date().toISOString(),
          userId: newUser.id,
          createdBy: createdBy,
        });
        const newProfile = await profile.save();
        membersSuccess.push(nameData);
      }
    };
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
// // url: /localhost:3000/api/members/create method: 'POST'
// exports.memberCreate = async (req, res, next) => {
//   const code = req.body.code;
//   const name = req.body.name;
//   const password = name;
//   const userId = req.userId;
//   const joinDate = req.body.joinDate;
//   const fullname = req.body.fullname;
//   const phone = req.body.phone;
//   const gender = req.body.gender;
//   const pob = req.body.pob;
//   const dob = req.body.dob;
//   const religion = req.body.religion;
//   const religionDetail = req.body.religionDetail;
//   const activeStatus = true;
//   const maritalStatus = req.body.maritalStatus;
//   const occupation = req.body.occupation;
//   const address = req.body.address;
//   const createdBy = userId;
//   try {
//     const checkErr = await authScope(userId, 'anggota', 'c');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     const checkUsername = await User.findOne({ where: { username: code } });
//     if (checkUsername) {
//       const error = new Error('No Anggota sudah digunakan!');
//       error.statusCode = 422;
//       return next(error);
//     }
//     const hashPass = await bcrypt.hash(password, 12);
//     const data = new User({
//       username: code,
//       password: hashPass,
//       createdBy: createdBy,
//     });
//     const newUser = await data.save();
//     const profile = new Profile({
//       profileType: 'Anggota',
//       code: code,
//       name: name,
//       fullname: fullname,
//       joinDate: joinDate,
//       phone: phone,
//       gender: gender,
//       pob: pob,
//       dob: dob,
//       religion: religion,
//       religionDetail: religionDetail,
//       activeStatus: activeStatus,
//       maritalStatus: maritalStatus,
//       occupation: occupation,
//       address: address,
//       userId: newUser.id,
//       createdBy: createdBy,
//     });
//     const newProfile = await profile.save();
//     if (!newUser || !newProfile) {
//       const error = new Error('Gagal membuat anggota baru!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const getMember = await Profile.findOne({
//       where: { userId: newProfile.userId },
//     });
//     res.status(201).json({
//       message: 'ok',
//       member: getMember,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // url: /localhost:3000/api/members/:memberId method: 'GET'
// exports.memberGet = async (req, res, next) => {
//   const memberId = req.params.memberId;
//   try {
//     const checkErr = await authScope(req.userId, 'anggota', 'v');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     const getMember = await Profile.findOne({
//       where: { code: memberId },
//     });
//     if (!getMember) {
//       const error = new Error('Anggota tidak ditemukan!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     res.status(200).json({
//       message: 'ok',
//       member: getMember,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // url: /localhost:3000/api/members/edit/:memberId method: 'POST'
// exports.memberEdit = async (req, res, next) => {
//   try {
//     const checkErr = await authScope(req.userId, 'anggota', 'u');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     // change req.body into object to pass into member.update()
//     const obj = JSON.parse(JSON.stringify(req.body));
//     const memberId = req.params.memberId;
//     const profile = await Profile.findOne({ where: { code: memberId } });
//     if (!profile) {
//       const error = new Error('Anggota tidak ditemukan!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const updatedProfile = await profile.update(obj);
//     if (!updatedProfile) {
//       const error = new Error('Update anggota gagal!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const getMember = await Profile.findOne({
//       where: { code: memberId },
//     });
//     res.status(200).json({
//       message: 'ok',
//       member: getMember,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // url: /localhost:3000/api/members/photo-upload/:memberId method: 'POST'
// exports.memberPhotoUpload = async (req, res, next) => {
//   const memberId = req.params.memberId;
//   try {
//     const checkErr = await authScope(req.userId, 'anggota', 'u');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const error = new Error('Validasi gagal!');
//       error.statusCode = 422;
//       return next(error);
//     }
//     if (!req.file) {
//       const error = new Error('Photo tidak ada.');
//       error.statusCode = 422;
//       return next(error);
//     }
//     const resizeInput = `images/profile/${memberId}/${req.file.filename}`;
//     const resizeOutput = `images/profile/${memberId}/${
//       req.file.filename
//     }_${req.body.filename.replace(',', '')}`;
//     // move image into profile folder
//     const moFile = await fse.move(req.file.path, resizeInput);
//     if (moFile) {
//       console.log('File successfully moved!');
//     }
//     // resize file
//     const reFile = await sharp(resizeInput)
//       .resize({ height: 200, width: 200 })
//       .toFile(resizeOutput);
//     if (reFile) {
//       console.log('File successfully resized!');
//       // delete if successfull
//       clearImage(resizeInput);
//     }
//     let profile = await Profile.findOne({ where: { userId: memberId } });
//     if (!profile) {
//       const error = new Error('Anggota tidak ditemukan');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const newPhotos = profile.arrPhotos
//       ? profile.arrPhotos + ',' + resizeOutput
//       : resizeOutput;
//     const profilePic = {
//       mainPhoto: profile.mainPhoto ? profile.mainPhoto : resizeOutput,
//       arrPhotos: newPhotos.toString(),
//     };
//     const updatedProfile = await profile.update(profilePic);
//     if (!updatedProfile) {
//       const error = new Error('Profil foto gagal terupdate!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const getProfile = await Profile.findOne({
//       where: { userId: memberId },
//     });
//     res.status(200).json({
//       message: 'ok',
//       member: getProfile,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // url: /localhost:3000/api/members/photo-delete/:memberId method: 'POST'
// exports.memberPhotoDelete = async (req, res, next) => {
//   const memberId = req.params.memberId;
//   const photo = req.body.photo;
//   try {
//     const checkErr = await authScope(req.userId, 'anggota', 'd');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     const member = await Profile.findOne({ where: { userId: memberId } });
//     let filteredPhotos;
//     if (!member) {
//       const error = new Error('Anggota tidak ditemukan!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     filteredPhotos = member.arrPhotos.split(',').filter((p) => {
//       return p !== photo;
//     });
//     clearImage(photo);
//     const memberPhoto = {
//       arrPhotos: filteredPhotos.toString(),
//     };
//     const updateMember = await member.update(memberPhoto);
//     if (!updateMember) {
//       const error = new Error('Gagal menghapus foto!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const getMember = await Profile.findOne({
//       where: { userId: updateMember.userId },
//     });
//     res.status(200).json({
//       message: 'ok',
//       member: getMember,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // url: /localhost:3000/api/members/delete/:memberId method: 'POST
// exports.memberDelete = async (req, res, next) => {
//   const memberId = req.params.memberId;
//   try {
//     const checkErr = await authScope(req.userId, 'anggota', 'd');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     const checkUser = await User.findOne({
//       where: { userId: memberId },
//       include: [{ model: Profile }],
//     });
//     if (!checkUser) {
//       const error = new Error('Anggota tidak ditemukan!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     if (checkUser.arrRoles === 'SA') {
//       const error = new Error(`kamu tidak memiliki otoritas!`);
//       error.statusCode = 401;
//       return next(error);
//     }
//     const data = JSON.stringify(checkUser.toJSON());
//     const dataRecyclebin = new Recyclebin({
//       itemId: checkUser.id,
//       category: 'User',
//       data: data,
//       deletedBy: req.userId,
//     });
//     const newRecyclebin = await dataRecyclebin.save();
//     if (!newRecyclebin) {
//       const error = new Error('Gagal menghapus user!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     const checkDelete = checkUser.destroy();
//     if (!checkDelete) {
//       const error = new Error('Gagal menghapus user!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     res.status(200).json({
//       message: 'ok',
//       userId: newRecyclebin.itemId,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // url: /localhost:3000/api/members/is-staff method: 'POST'
// exports.membersIsStaff = async (req, res, next) => {
//   try {
//     const checkErr = await authScope(req.userId, 'pengurus', 'v');
//     if (checkErr) {
//       return next(checkErr);
//     }
//     let fetchData = await Profile.findAndCountAll({
//       where: { profileType: 'Pengurus' },
//     });
//     if (!fetchData) {
//       const error = new Error('Pengurus tidak ditemukan!');
//       error.statusCode = 404;
//       return next(error);
//     }
//     let fetchCount = fetchData.count;
//     let fetchRow = fetchData.rows;
//     res.status(200).json({
//       message: 'ok',
//       totals: fetchCount,
//       staffs: fetchRow,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
// // // url: /localhost:3000/api/users/password-reset/:userId method: 'POST'
// // exports.userPasswordReset = async (req, res, next) => {
// //   const userId = req.params.userId;
// //   const password = req.body.password;
// //   const updatedBy = req.body.updatedBy;
// //   try {
// //     const checkErr = await authScope(req.userId, 'user', 'u');
// //     if (checkErr) {
// //       return next(checkErr);
// //     }
// //     const hashPass = await bcrypt.hash(password, 12);
// //     const user = await User.findByPk(userId);
// //     if (!user) {
// //       const error = new Error('User tidak ditemukan!');
// //       error.statusCode = 404;
// //       return next(error);
// //     }
// //     const updatedUser = await user.update({
// //       password: hashPass,
// //       updatedBy: updatedBy,
// //     });
// //     if (!updatedUser) {
// //       const error = new Error('Reset password gagal!');
// //       error.statusCode = 404;
// //       return next(error);
// //     }
// //     let getUser = await User.scope('withoutPassword').findOne({
// //       where: { id: updatedUser.id },
// //       include: [{ model: Profile }],
// //     });
// //     res.status(200).json({
// //       message: 'ok',
// //       user: getUser,
// //       profile: getUser.profile,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     next(error);
// //   }
// // };
// // // url: /localhost:3000/api/users/account-edit/:userId method: 'POST'
// // exports.userAccountEdit = async (req, res, next) => {
// //   const userId = req.params.userId;
// //   const username = req.body.username;
// //   try {
// //     const checkErr = await authScope(req.userId, 'user', 'u');
// //     if (checkErr) {
// //       return next(checkErr);
// //     }
// //     const checkId = await User.findByPk(userId);
// //     if (checkId.arrRoles === 'SA') {
// //       const error = new Error(`Kamu tidak memiliki otoritas!`);
// //       error.statusCode = 401;
// //       return next(error);
// //     }
// //     if (username !== checkId.username) {
// //       const checkUsername = await User.findOne({
// //         where: { username: username },
// //       });
// //       if (checkUsername) {
// //         const error = new Error('Username sudah digunakan');
// //         error.statusCode = 422;
// //         return next(error);
// //       }
// //     }
// //     const newData = {};
// //     newData.username = username;
// //     newData.updatedBy = req.body.updatedBy;
// //     let getUser;
// //     if (req.body.resetPassword) {
// //       let hashPass = await bcrypt.hash(req.body.resetPassword, 12);
// //       newData.password = hashPass;
// //     }
// //     const updatedUser = await checkId.update(newData);
// //     if (!updatedUser) {
// //       const error = new Error('Update akun gagal!');
// //       error.statusCode = 404;
// //       return next(error);
// //     }
// //     getUser = await User.scope('withoutPassword').findOne({
// //       where: { id: updatedUser.id },
// //       include: [{ model: Profile }],
// //     });
// //     res.status(200).json({
// //       message: 'ok',
// //       user: getUser,
// //       profile: getUser.profile,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     next(error);
// //   }
// // };
// // // url: /localhost:3000/api/users/role-edit/:userId method: 'POST'
// // exports.userRoleEdit = async (req, res, next) => {
// //   const userId = req.params.userId;
// //   try {
// //     const checkErr = await authScope(req.userId, 'user', 'u');
// //     if (checkErr) {
// //       return next(checkErr);
// //     }
// //     const checkUser = await User.findByPk(userId);
// //     if (!checkUser) {
// //       const error = new Error('User tidak ditemukan!');
// //       error.statusCode = 404;
// //       return next(error);
// //     }
// //     if (checkUser.arrRoles === 'SA') {
// //       const error = new Error(`Kamu tidak memiliki otoritas!`);
// //       error.statusCode = 401;
// //       return next(error);
// //     }
// //     const newData = {
// //       arrRoles: checkUser.arrRoles === 'SA' ? 'SA' : req.body.arrRoles,
// //       updatedBy:
// //         checkUser.arrRoles === 'SA' ? checkUser.updatedBy : req.body.updatedBy,
// //     };
// //     const updatedUser = await checkUser.update(newData);
// //     if (!updatedUser) {
// //       const error = new Error('Update role gagal!');
// //       error.statusCode = 404;
// //       return next(error);
// //     }
// //     const getUser = await User.scope('withoutPassword').findOne({
// //       where: { id: updatedUser.id },
// //       include: [{ model: Profile }],
// //     });
// //     const getRoles = await Role.findAll({
// //       attributes: ['id', 'roleName', 'arrAuthorities'],
// //     });
// //     res.status(200).json({
// //       message: 'ok',
// //       user: getUser,
// //       profile: getUser.profile,
// //       arrAuth: getRoles,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     next(error);
// //   }
// // };

// const clearImage = (filePath) => {
//   filePath = path.join(__dirname, '..', filePath);
//   fs.unlink(filePath, (error) => console.log(error));
// };
