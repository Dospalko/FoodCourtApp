const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  authToken: {
    type: String,
    required: true
  },
  // Voliteľne uložené perzistentné ID zákazníka, ak notifikácia patrí zákazníkovi
  customerId: {
    type: String,
    required: false
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
