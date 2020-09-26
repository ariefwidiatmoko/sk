const express = require('express');

const recyclebinController = require('../controllers/recyclebin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/recyclebins method: 'GET'
router.get('/', isAuth, recyclebinController.recyclebinsIndex);

module.exports = router;
