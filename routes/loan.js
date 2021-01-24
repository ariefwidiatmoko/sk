const express = require('express');

const loanController = require('../controllers/loan');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/loans method: 'POST'
router.post('/', isAuth, loanController.loansGet);
// url: /localhost:3000/api/loans/create method: 'POST'
router.post('/create', isAuth, loanController.loanCreate);
// url: /localhost:3000/api/loans/update/:loanId method: 'POST'
router.post('/update/:loanId', isAuth, loanController.loanUpdate);
// url: /localhost:3000/api/loans/delete/:loanId method: 'POST'
router.post('/delete/:loanId', isAuth, loanController.loanDelete);
// url: /localhost:3000/api/loans/restore/:loanId method: 'POST'
router.post('/restore/:loanId', isAuth, loanController.loanRestore);
// url: /localhost:3000/api/loans/hard-delete/:loanId method: 'POST'
router.post('/hard-delete/:loanId', isAuth, loanController.loanHardDel);

module.exports = router;
