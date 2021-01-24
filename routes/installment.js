const express = require('express');

const installmentController = require('../controllers/installment');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/installments method: 'POST'
router.post('/', isAuth, installmentController.installmentsGet);
// url: /localhost:3000/api/installment/:installmentId method: 'POST'
router.post('/view/:installmentId', isAuth, installmentController.installmentGet);
// url: /localhost:3000/api/installments/create method: 'POST'
router.post('/create', isAuth, installmentController.installmentCreate);
// url: /localhost:3000/api/installments/update/:installmentId method: 'POST'
router.post('/update/:installmentId', isAuth, installmentController.installmentUpdate);
// url: /localhost:3000/api/installments/delete/:installmentId method: 'POST'
router.post('/delete/:installmentId', isAuth, installmentController.installmentDelete);
// url: /localhost:3000/api/installments/restore/:installmentId method: 'POST'
router.post('/restore/:installmentId', isAuth, installmentController.installmentRestore);
// url: /localhost:3000/api/installments/hard-delete/:installmentId method: 'POST'
router.post('/hard-delete/:installmentId', isAuth, installmentController.installmentHardDel);

module.exports = router;
