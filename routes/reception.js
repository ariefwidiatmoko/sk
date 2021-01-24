const express = require('express');

const receptionController = require('../controllers/reception');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/receptions method: 'POST'
router.post('/', isAuth, receptionController.receptionsGet);
// url: /localhost:3000/api/receptions/create method: 'POST'
router.post('/create', isAuth, receptionController.receptionCreate);
// url: /localhost:3000/api/receptions/update/:receptionId method: 'POST'
router.post('/update/:receptionId', isAuth, receptionController.receptionUpdate);
// url: /localhost:3000/api/receptions/delete/:receptionId method: 'POST'
router.post('/delete/:receptionId', isAuth, receptionController.receptionDelete);
// url: /localhost:3000/api/receptions/restore/:receptionId method: 'POST'
router.post('/restore/:receptionId', isAuth, receptionController.receptionRestore);
// url: /localhost:3000/api/receptions/hard-delete/:receptionId method: 'POST'
router.post('/hard-delete/:receptionId', isAuth, receptionController.receptionHardDel);

module.exports = router;
