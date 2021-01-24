const express = require('express');

const journalController = require('../controllers/journal');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/journals method: 'POST'
router.post('/', isAuth, journalController.journalsGet);
// url: /localhost:3000/api/journals/create method: 'POST'
router.post('/create', isAuth, journalController.journalCreate);
// url: /localhost:3000/api/journals/update/:journalId method: 'POST'
router.post('/update/:journalId', isAuth, journalController.journalUpdate);
// url: /localhost:3000/api/journals/delete/:journalId method: 'POST'
router.post('/delete/:journalId', isAuth, journalController.journalDelete);
// url: /localhost:3000/api/journals/restore/:journalId method: 'POST'
router.post('/restore/:journalId', isAuth, journalController.journalRestore);
// url: /localhost:3000/api/journals/hard-delete/:journalId method: 'POST'
router.post('/hard-delete/:journalId', isAuth, journalController.journalHardDel);

module.exports = router;
