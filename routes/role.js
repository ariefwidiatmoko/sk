const express = require('express');

const roleController = require('../controllers/role');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/roles method: 'GET'
router.post('/', isAuth, roleController.rolesIndex);
// url: /localhost:3000/api/roles/create method: 'POST'
router.post('/create', isAuth, roleController.roleCreate);
// url: /localhost:3000/api/roles/update/:roleId method: 'POST'
router.post('/update/:roleId', isAuth, roleController.roleUpdate);

module.exports = router;
