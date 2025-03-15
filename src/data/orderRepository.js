// src/data/orderRepository.js

let orders = [];
let orderIdCounter = 1;

module.exports = {
  getAllOrders: () => orders,

  createOrder: ({ items, totalAmount, pickupTime, status = 'pending' }) => {
    const newOrder = {
      id: orderIdCounter++,
      items,
      totalAmount,
      pickupTime,
      status
    };
    orders.push(newOrder);
    return newOrder;
  },

  updateOrder: ({ id, updates }) => {
    const index = orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
      throw new Error('Order not found');
    }
    orders[index] = { ...orders[index], ...updates };
    return orders[index];
  },

  deleteOrder: (id) => {
    const index = orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
      throw new Error('Order not found');
    }
    const deletedOrder = orders.splice(index, 1)[0];
    return deletedOrder;
  }
};
