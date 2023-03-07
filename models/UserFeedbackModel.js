const mongoose = require('mongoose');

const UserFeedbackModel = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userdatas', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserFeedback = mongoose.model('UserFeedback', UserFeedbackModel);

module.exports = UserFeedback;
