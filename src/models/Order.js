// Príklad pre Order (src/models/Order.js)
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
  customerAuthToken: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  restaurantAuthToken: {
    type: String,
    required: true
  }
}, { timestamps: true });

orderSchema.virtual('id').get(function () {
  return this._id.toString();
});

orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
