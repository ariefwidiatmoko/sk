const express = require('express');

const memberController = require('../controllers/member');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// url: /localhost:3000/api/members method: 'POST'
router.post('/', isAuth, memberController.membersIndex);
// url: /localhost:3000/api/members/create method: 'POST'
router.post('/create', isAuth, memberController.memberCreate);
// url: /localhost:3000/api/members/:memberId method: 'GET'
router.get('/:memberId', isAuth, memberController.memberGet);
// // url: /localhost:3000/api/members/edit/:userId method: 'POST'
router.post('/edit/:memberId', isAuth, memberController.memberEdit);
// // url: /localhost:3000/api/members/photo-upload/:memberId method: 'POST'
router.post('/photo-upload/:memberId', isAuth, memberController.memberPhotoUpload);
// // url: /localhost:3000/api/members/photo-delete/:memberId method: 'POST'
router.post('/photo-delete/:memberId', isAuth, memberController.memberPhotoDelete);
// // url: /localhost:3000/api/members/delete/:memberId method: 'POST'
router.post('/delete/:memberId', isAuth, memberController.memberDelete);
// // url: /localhost:3000/api/members/restore/:memberId method: 'POST'
router.post('/restore/:memberId', isAuth, memberController.memberRestore);
// // url: /localhost:3000/api/members/hard-delete/:memberId method: 'POST'
router.post('/hard-delete/:memberId', isAuth, memberController.memberHardDel);
// // url: /localhost:3000/api/members/import method: 'POST'
router.post('/import', isAuth, memberController.membersImport);

module.exports = router;
