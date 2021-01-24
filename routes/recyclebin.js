const express = require('express');

const recyclebinController = require('../controllers/recyclebin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/recyclebins method: 'POST'
router.post('/', isAuth, recyclebinController.recyclebinsGet);
// url: /localhost:3000/api/recyclebins/restore/:recyclebinId method: 'POST'
router.post('/restore/:recyclebinId', isAuth, recyclebinController.recyclebinRestore);
// url: /localhost:3000/api/recyclebins/delete/:recyclebinId method: 'POST'
router.post('/delete/:recyclebinId', isAuth, recyclebinController.recyclebinDelete);


module.exports = router;
