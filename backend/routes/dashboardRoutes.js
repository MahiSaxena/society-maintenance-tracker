const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, requireRole('admin'), getDashboard);

module.exports = router;