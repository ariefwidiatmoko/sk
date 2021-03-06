const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/users method: 'GET'
router.post('/', isAuth, userController.usersIndex);
// url: /localhost:3000/api/users/roles method: 'GET'
router.get('/roles', isAuth, userController.rolesIndex);
// url: /localhost:3000/api/users/:userId method: 'GET'
router.get('/:userId', isAuth, userController.userGet);
// url: /localhost:3000/api/users/edit/:userId method: 'POST'
router.post('/edit/:userId', isAuth, userController.userEdit);
// url: /localhost:3000/api/users/password-reset/:userId method: 'POST'
router.post('/password-reset/:userId', isAuth, userController.userPasswordReset);
// url: /localhost:3000/api/users/account-edit/:userId method: 'POST'
router.post('/account-edit/:userId', isAuth, userController.userAccountEdit);
// url: /localhost:3000/api/users/role-edit/:userId method: 'POST'
router.post('/role-edit/:userId', isAuth, userController.userRoleEdit);
// url: /localhost:3000/api/users/create method: 'POST'
router.post('/create', isAuth, userController.userCreate);
// url: /localhost:3000/api/users/delete/:userId method: 'POST'
router.post('/delete/:userId', isAuth, userController.userDelete);
// // url: /localhost:3000/api/users/restore/:userId method: 'POST'
router.post('/restore/:userId', isAuth, userController.userRestore);
// // url: /localhost:3000/api/users/hard-delete/:userId method: 'POST'
router.post('/hard-delete/:userId', isAuth, userController.userHardDel);
// url: /localhost:3000/api/users/import method: 'POST'
router.post('/import', isAuth, userController.usersImport);

module.exports = router;
