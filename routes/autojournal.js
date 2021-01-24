const express = require('express');

const autoJournalController = require('../controllers/autoJournal');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/auto-journals method: 'POST'
router.post('/', isAuth, autoJournalController.autoJournalsGet);
// url: /localhost:3000/api/auto-journals/create method: 'POST'
router.post('/create', isAuth, autoJournalController.autoJournalCreate);
// url: /localhost:3000/api/auto-journals/update/:code method: 'POST'
router.post('/update/:autojournalId', isAuth, autoJournalController.autoJournalUpdate);
// // url: /localhost:3000/api/auto-journals/delete/:accountId method: 'POST'
// router.post('/delete/:accountId', isAuth, accountController.accountDelete);
// // url: /localhost:3000/api/auto-journals/restore/:accountId method: 'POST'
// router.post('/restore/:accountId', isAuth, accountController.accountRestore);
// // url: /localhost:3000/api/auto-journals/hard-delete/:accountId method: 'POST'
// router.post('/hard-delete/:accountId', isAuth, accountController.accountHardDel);
// // url: /localhost:3000/api/auto-journals/import method: 'POST'
// router.post('/import', isAuth, accountController.accountsImport);

module.exports = router;
