const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  authToken: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true  // napr. 'new', 'update', 'deleted'
  },
  orderId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
