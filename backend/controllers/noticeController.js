const Notice = require('../models/Notice');
const User = require('../models/User');
const { sendEmail, importantNoticeEmail } = require('../utils/email');

// @route GET /api/notices  (any logged-in user) - pinned/important first
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('postedBy', 'name')
      .sort({ important: -1, createdAt: -1 });
    res.json({ notices });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notices', error: err.message });
  }
};

// @route POST /api/notices  (admin)
const createNotice = async (req, res) => {
  try {
    const { title, content, important } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const notice = await Notice.create({
      title,
      content,
      important: !!important,
      postedBy: req.user._id,
    });

    // Email all residents when an important notice is posted
    if (notice.important) {
      const residents = await User.find({ role: 'resident' }).select('name email');
      residents.forEach((resident) => {
        const { subject, html } = importantNoticeEmail(resident.name, notice);
        sendEmail({ to: resident.email, subject, html }).catch(() => {});
      });
    }

    res.status(201).json({ notice });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notice', error: err.message });
  }
};

// @route DELETE /api/notices/:id  (admin)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notice', error: err.message });
  }
};

module.exports = { getNotices, createNotice, deleteNotice };