const Complaint = require('../models/Complaint');

const OVERDUE_DAYS = () => Number(process.env.OVERDUE_THRESHOLD_DAYS) || 3;
const getDashboard = async (req, res) => {
  try {
    const [byStatus, byCategory, total] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.countDocuments(),
    ]);

    const thresholdDate = new Date(Date.now() - OVERDUE_DAYS() * 24 * 60 * 60 * 1000);
    const overdueCount = await Complaint.countDocuments({
      status: { $ne: 'Resolved' },
      createdAt: { $lt: thresholdDate },
    });
    
    const statusCounts = { Open: 0, 'In Progress': 0, Resolved: 0 };
    byStatus.forEach((s) => (statusCounts[s._id] = s.count));

    const categoryCounts = {};
    byCategory.forEach((c) => (categoryCounts[c._id] = c.count));

    res.json({
      total,
      byStatus: statusCounts,
      byCategory: categoryCounts,
      overdueCount,
      overdueThresholdDays: OVERDUE_DAYS(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

module.exports = { getDashboard };