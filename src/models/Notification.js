// src/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Notification = sequelize.define('Notification', {
  authToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false  // napr. 'update', 'deleted'
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Notification;
