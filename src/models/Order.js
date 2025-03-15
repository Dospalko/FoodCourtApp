// src/models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: { type: [String], required: true },
  totalAmount: { type: Number, required: true },
  pickupTime: { type: Date, required: true },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Order', orderSchema);
