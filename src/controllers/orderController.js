// src/controllers/orderController.js

const orderRepository = require('../data/orderRepository');

exports.getAllOrders = (req, res) => {
  try {
    const orders = orderRepository.getAllOrders();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

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

exports.updateOrder = (req, res) => {
  const { id } = req.params;
  const updates = req.body; // očakávame napr. { status: 'ready' }
  try {
    const updatedOrder = orderRepository.updateOrder({ id, updates });
    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrder = (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = orderRepository.deleteOrder(id);
    res.json({ message: 'Order deleted', order: deletedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
