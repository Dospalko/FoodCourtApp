// src/controllers/orderController.js
const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

exports.createOrder = async (req, res) => {
  const { items, totalAmount, pickupTime } = req.body;
  if (!items || !totalAmount || !pickupTime) {
    return res.status(400).json({ message: 'Missing required fields (items, totalAmount, pickupTime)' });
  }
  try {
    const newOrder = await Order.create({ items, totalAmount, pickupTime });
    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await Order.update(updates, { where: { id } });
    const updatedOrder = await Order.findByPk(id);
    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = await Order.findByPk(id);
    await Order.destroy({ where: { id } });
    res.json({ message: 'Order deleted', order: deletedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};
