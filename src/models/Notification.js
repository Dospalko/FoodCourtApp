const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  authToken: {
    type: String,
    required: true
  },
  customerId: {
    type: String
    // Môže byť voliteľné – podľa potreby
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

// Pridanie virtuálneho poľa "id"
notificationSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Zahrnutie virtuálnych polí do JSON výstupu
notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
