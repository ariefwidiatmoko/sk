const express = require('express');

const accountController = require('../controllers/account');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/members method: 'POST'
router.post('/', isAuth, accountController.accountsGet);
// // url: /localhost:3000/api/accounts/import method: 'POST'
router.post('/import', isAuth, accountController.accountsImport);
// url: /localhost:3000/api/members/create method: 'POST'
// router.post('/create', isAuth, memberController.memberCreate);
// // url: /localhost:3000/api/members/:memberId method: 'GET'
// router.get('/:memberId', isAuth, memberController.memberGet);
// // // url: /localhost:3000/api/members/edit/:userId method: 'POST'
// router.post('/edit/:memberId', isAuth, memberController.memberEdit);
// // // url: /localhost:3000/api/members/photo-upload/:memberId method: 'POST'
// router.post('/photo-upload/:memberId', isAuth, memberController.memberPhotoUpload);
// // // url: /localhost:3000/api/members/photo-delete/:memberId method: 'POST'
// router.post('/photo-delete/:memberId', isAuth, memberController.memberPhotoDelete);
// // // url: /localhost:3000/api/members/delete/:memberId method: 'POST'
// router.post('/delete/:memberId', isAuth, memberController.memberDelete);
// // url: /localhost:3000/api/members/is-staff method: 'POST'
// router.post('/is-staff', isAuth, memberController.membersIsStaff);
// // // url: /localhost:3000/api/users/role-edit/:userId method: 'POST'
// // router.post('/role-edit/:userId', isAuth, userController.userRoleEdit);
// // // url: /localhost:3000/api/users/create method: 'POST'
// // router.post('/create', isAuth, userController.userCreate);
// // // url: /localhost:3000/api/users/delete/:userId method: 'POST'
// // router.post('/delete/:userId', isAuth, userController.userDelete);

module.exports = router;
