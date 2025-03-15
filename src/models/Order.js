const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: {
    type: [String],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  pickupTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    required: true
  },
  // Pôvodný token zákazníka (môže sa meniť pri relácii)
  customerAuthToken: {
    type: String,
    required: true
  },
  // Perzistentné ID zákazníka – napr. _id z kolekcie User
  customerId: {
    type: String,
    required: true
  },
  // Token (alebo ID) reštaurácie – pre dynamický výber
  restaurantAuthToken: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
