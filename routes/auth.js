const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();
// url: /localhost:3000/api/auth/login method: 'POST'
router.post('/login', authController.login);

module.exports = router;
