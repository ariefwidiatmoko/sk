const express = require('express');

const managerController = require('../controllers/manager');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/managers method: 'POST'
router.post('/', isAuth, managerController.managersIndex);
// url: /localhost:3000/api/managers/:managerId method: 'POST'
router.get('/:managerId', isAuth, managerController.managerGet);
// // url: /localhost:3000/api/managers/edit/:userId method: 'POST'
router.post('/edit/:managerId', isAuth, managerController.managerEdit);
// url: /localhost:3000/api/managers/set/:managerId method: 'POST'
router.post('/set/:managerId', isAuth, managerController.managerSet);
// url: /localhost:3000/api/managers/photo-upload/:managerId method: 'POST'
router.post('/photo-upload/:managerId', isAuth, managerController.managerPhotoUpload);
// url: /localhost:3000/api/managers/photo-delete/:managerId method: 'POST'
router.post('/photo-delete/:managerId', isAuth, managerController.managerPhotoDelete);

module.exports = router;
