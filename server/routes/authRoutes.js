// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registrar novo usuário (retorna token)
router.post('/register', authController.register);

// Login (email + senha) -> { token, user }
router.post('/login', authController.login);

module.exports = router;
