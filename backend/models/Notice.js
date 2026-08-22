const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    important: { type: Boolean, default: false },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Pinned (important) notices surface first, then newest first
noticeSchema.index({ important: -1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);