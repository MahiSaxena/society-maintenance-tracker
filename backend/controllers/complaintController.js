const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendEmail, complaintStatusEmail } = require('../utils/email');

const OVERDUE_DAYS = () => Number(process.env.OVERDUE_THRESHOLD_DAYS) || 3;

// Adds a computed `overdue` boolean to a complaint (plain object or doc)
// without persisting it, since "overdue" is always relative to "now".
const withOverdueFlag = (complaintDoc) => {
  const obj = complaintDoc.toObject ? complaintDoc.toObject() : complaintDoc;
  const isResolved = obj.status === 'Resolved';
  const ageMs = Date.now() - new Date(obj.createdAt).getTime();
  const thresholdMs = OVERDUE_DAYS() * 24 * 60 * 60 * 1000;
  obj.overdue = !isResolved && ageMs > thresholdMs;
  return obj;
};

// @route POST /api/complaints  (resident)
const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    if (!category || !description) {
      return res.status(400).json({ message: 'Category and description are required' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await Complaint.create({
      resident: req.user._id,
      category,
      description,
      photoUrl,
      status: 'Open',
      priority: 'Low',
      history: [
        {
          status: 'Open',
          note: 'Complaint raised',
          changedBy: req.user._id,
          changedByName: req.user.name,
        },
      ],
    });

    res.status(201).json({ complaint: withOverdueFlag(complaint) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create complaint', error: err.message });
  }
};

// @route GET /api/complaints/mine  (resident) - own complaints + full history
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ resident: req.user._id }).sort({ createdAt: -1 });
    res.json({ complaints: complaints.map(withOverdueFlag) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: err.message });
  }
};

// @route GET /api/complaints  (admin) - all complaints, filterable, overdue-first
const getAllComplaints = async (req, res) => {
  try {
    const { category, status, dateFrom, dateTo } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const complaints = await Complaint.find(query)
      .populate('resident', 'name email flatNumber')
      .sort({ createdAt: -1 });

    const withFlags = complaints.map(withOverdueFlag);

    // Overdue complaints surface at the top of the admin view, as required.
    // Within each group (overdue / not overdue), keep newest first.
    withFlags.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ complaints: withFlags });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: err.message });
  }
};

// @route GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'resident',
      'name email flatNumber'
    );
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Residents may only view their own complaint
    if (req.user.role === 'resident' && String(complaint.resident._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ complaint: withOverdueFlag(complaint) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaint', error: err.message });
  }
};

// @route PATCH /api/complaints/:id/status  (admin) - append to history
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('resident');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Once resolved, a complaint is closed and cannot be reopened/edited further.
    if (complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'This complaint is resolved and closed' });
    }

    complaint.status = status;
    complaint.history.push({
      status,
      note: note || '',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
    });

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Notify resident by email (non-blocking failure)
    const { subject, html } = complaintStatusEmail(complaint.resident.name, complaint);
    sendEmail({ to: complaint.resident.email, subject, html }).catch(() => {});

    res.json({ complaint: withOverdueFlag(complaint) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

// @route PATCH /api/complaints/:id/priority  (admin)
const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const validPriorities = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.priority = priority;
    await complaint.save();

    res.json({ complaint: withOverdueFlag(complaint) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update priority', error: err.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateStatus,
  updatePriority,
};