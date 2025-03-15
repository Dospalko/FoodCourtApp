// src/models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Order = sequelize.define('Order', {
  // Automaticky vytvorený primárny kľúč id
  items: {
    type: DataTypes.JSON, // Ukladáme pole reťazcov ako JSON (alternatívne môžeš definovať samostatný model)
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  pickupTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  timestamps: true // automatické pridávanie createdAt a updatedAt
});

module.exports = Order;
