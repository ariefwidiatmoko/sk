const express = require('express');

const supervisorController = require('../controllers/supervisor');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/supervisors method: 'POST'
router.post('/', isAuth, supervisorController.supervisorsIndex);
// url: /localhost:3000/api/supervisors/:supervisorId method: 'POST'
router.get('/:supervisorId', isAuth, supervisorController.supervisorGet);
// // url: /localhost:3000/api/supervisors/edit/:userId method: 'POST'
router.post('/edit/:supervisorId', isAuth, supervisorController.supervisorEdit);
// url: /localhost:3000/api/supervisors/set/:supervisorId method: 'POST'
router.post('/set/:supervisorId', isAuth, supervisorController.supervisorSet);
// url: /localhost:3000/api/supervisors/photo-upload/:supervisorId method: 'POST'
router.post('/photo-upload/:supervisorId', isAuth, supervisorController.supervisorPhotoUpload);
// url: /localhost:3000/api/supervisors/photo-delete/:supervisorId method: 'POST'
router.post('/photo-delete/:supervisorId', isAuth, supervisorController.supervisorPhotoDelete);

module.exports = router;
