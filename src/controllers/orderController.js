// src/controllers/orderController.js

/**
 * orderController.js
 * Spracováva operácie s objednávkami.
 */

// Pre jednoduché riešenie budeme používať in-memory pole
let orders = [];
let orderIdCounter = 1;

/**
 * Funkcia pre získanie všetkých objednávok.
 */
exports.getAllOrders = (req, res) => {
    res.json({ orders });
};

/**
 * Funkcia pre vytvorenie novej objednávky.
 * Očakáva v tele požiadavky polia: items, totalAmount, pickupTime.
 */
exports.createOrder = (req, res) => {
    const { items, totalAmount, pickupTime } = req.body;

    // Jednoduchá validácia
    if (!items || !totalAmount || !pickupTime) {
        return res.status(400).json({ message: 'Chýbajú povinné polia (items, totalAmount, pickupTime)' });
    }

    // Vytvorenie novej objednávky
    const newOrder = {
        id: orderIdCounter++,
        items,
        totalAmount,
        pickupTime,
        status: 'pending'
    };

    orders.push(newOrder);

    // Tu môžeme neskôr spustiť notifikáciu cez Socket.io, ak sa objednávka zmení.
    res.status(201).json({ message: 'Objednávka vytvorená', order: newOrder });
};
