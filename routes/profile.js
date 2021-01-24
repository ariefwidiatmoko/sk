const express = require('express');

const profileController = require('../controllers/profile');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/profile/:userId method: 'GET'
router.get('/:userId', isAuth, profileController.profileGet);
// url: /localhost:3000/api/profile/edit/:userId method: 'POST'
router.post('/edit/:userId', isAuth, profileController.profileEdit);
// url: /localhost:3000/api/profile/picture-upload/:userId method: 'POST'
router.post('/picture-upload/:userId', isAuth, profileController.profilePictureUpload);
// url: /localhost:3000/api/profile/photo-delete/:userId method: 'POST'
router.post('/photo-delete/:userId', isAuth, profileController.profilePhotoDelete);
// url: /localhost:3000/api/profile/password-reset/:userId method: 'POST'
router.post('/password-reset/:userId', isAuth, profileController.profilePasswordReset);

module.exports = router;
