const express = require('express');
const { register, login } = require('../controllers/userController');

const router = express.Router();

// POST /api/users/register
router.post('/register', register);

// POST /api/users/login
router.post('/login', login);

module.exports = router;
