const express = require('express');

const savingController = require('../controllers/saving');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/savings method: 'POST'
router.post('/', isAuth, savingController.savingsGet);
// url: /localhost:3000/api/savings/create method: 'POST'
router.post('/create', isAuth, savingController.savingCreate);
// url: /localhost:3000/api/savings/update/:savingId method: 'POST'
router.post('/update/:savingId', isAuth, savingController.savingUpdate);
// url: /localhost:3000/api/savings/delete/:savingId method: 'POST'
router.post('/delete/:savingId', isAuth, savingController.savingDelete);
// url: /localhost:3000/api/savings/restore/:savingId method: 'POST'
router.post('/restore/:savingId', isAuth, savingController.savingRestore);
// url: /localhost:3000/api/savings/hard-delete/:savingId method: 'POST'
router.post('/hard-delete/:savingId', isAuth, savingController.savingHardDel);

module.exports = router;
