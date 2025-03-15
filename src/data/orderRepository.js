// src/data/orderRepository.js
// Jednoduchý in-memory repozitár pre objednávky
let orders = [];
let orderIdCounter = 1;

module.exports = {
  // Získanie všetkých objednávok
  getAllOrders: () => orders,
  // Vytvorenie novej objednávky
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
  }
};
