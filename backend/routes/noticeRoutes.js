const express = require('express');
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotices);
router.post('/', requireRole('admin'), createNotice);
router.delete('/:id', requireRole('admin'), deleteNotice);

module.exports = router;