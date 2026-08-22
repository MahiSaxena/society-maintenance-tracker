const mongoose = require('mongoose');

// Each entry records one transition in the complaint's lifecycle.
// Keeping this as an embedded array (not a separate collection) means the
// full history always loads with the complaint in a single query, and it
// naturally preserves order without needing extra indexes/joins.
const historyEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      required: true,
    },
    note: { type: String, trim: true, default: '' },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      required: true,
      enum: ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Parking', 'Noise', 'Other'],
    },
    description: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: null },

    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },

    history: { type: [historyEntrySchema], default: [] },

    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ resident: 1 });
complaintSchema.methods.isOverdue = function (thresholdDays) {
  if (this.status === 'Resolved') return false;
  const ageMs = Date.now() - this.createdAt.getTime();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  return ageMs > thresholdMs;
};

module.exports = mongoose.model('Complaint', complaintSchema);