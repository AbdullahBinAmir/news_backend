const mongoose = require('mongoose');

const CustomerSupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userdatas', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CustomerSupport = mongoose.model('CustomerSupport', CustomerSupportSchema);

module.exports = CustomerSupport;
