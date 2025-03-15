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
  // Nové pole – identifikátor restaurácie pre túto objednávku
  restaurantAuthToken: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
