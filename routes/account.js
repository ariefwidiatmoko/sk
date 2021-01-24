const express = require('express');

const accountController = require('../controllers/account');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/accounts method: 'POST'
router.post('/', isAuth, accountController.accountsGet);
// url: /localhost:3000/api/accounts/create method: 'POST'
router.post('/create', isAuth, accountController.accountCreate);
// url: /localhost:3000/api/accounts/update/:accountId method: 'POST'
router.post('/update/:accountId', isAuth, accountController.accountUpdate);
// url: /localhost:3000/api/accounts/delete/:accountId method: 'POST'
router.post('/delete/:accountId', isAuth, accountController.accountDelete);
// url: /localhost:3000/api/accounts/restore/:accountId method: 'POST'
router.post('/restore/:accountId', isAuth, accountController.accountRestore);
// url: /localhost:3000/api/accounts/hard-delete/:accountId method: 'POST'
router.post('/hard-delete/:accountId', isAuth, accountController.accountHardDel);
// url: /localhost:3000/api/accounts/import method: 'POST'
router.post('/import', isAuth, accountController.accountsImport);

module.exports = router;
