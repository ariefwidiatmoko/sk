const express = require('express');

const staffController = require('../controllers/staff');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/staffs method: 'POST'
router.post('/', isAuth, staffController.staffsIndex);
// url: /localhost:3000/api/staffs/:staffId method: 'POST'
router.get('/:staffId', isAuth, staffController.staffGet);
// // url: /localhost:3000/api/staffs/edit/:userId method: 'POST'
router.post('/edit/:staffId', isAuth, staffController.staffEdit);
// url: /localhost:3000/api/staffs/set/:staffId method: 'POST'
router.post('/set/:staffId', isAuth, staffController.staffSet);
// url: /localhost:3000/api/staffs/photo-upload/:staffId method: 'POST'
router.post('/photo-upload/:staffId', isAuth, staffController.staffPhotoUpload);
// url: /localhost:3000/api/staffs/photo-delete/:staffId method: 'POST'
router.post('/photo-delete/:staffId', isAuth, staffController.staffPhotoDelete);

module.exports = router;
