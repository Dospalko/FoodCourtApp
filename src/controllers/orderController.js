// src/controllers/orderController.js
const orderRepository = require('../data/orderRepository');

// Získanie všetkých objednávok (REST API)
exports.getAllOrders = (req, res) => {
  try {
    const orders = orderRepository.getAllOrders();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Vytvorenie novej objednávky (REST API)
exports.createOrder = (req, res) => {
  const { items, totalAmount, pickupTime } = req.body;
  if (!items || !totalAmount || !pickupTime) {
    return res.status(400).json({ message: 'Missing required fields (items, totalAmount, pickupTime)' });
  }
  try {
    const newOrder = orderRepository.createOrder({ items, totalAmount, pickupTime });
    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};
