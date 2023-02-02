const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();


router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);

module.exports = router;