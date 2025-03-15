// Importujeme express a vytvoríme router
const express = require('express');
const router = express.Router();

// Import kontroléra, ktorý bude spracovávať logiku objednávok
const orderController = require('../controllers/orderController');

// GET endpoint pre získanie všetkých objednávok
router.get('/', orderController.getAllOrders);

// POST endpoint pre vytvorenie novej objednávky
router.post('/', orderController.createOrder);

// Exportujeme router, aby sme ho mohli použiť v server.js
module.exports = router;
