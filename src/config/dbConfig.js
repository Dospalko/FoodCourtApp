// src/config/dbConfig.js
const { Sequelize } = require('sequelize');

// Vytvorenie inštancie Sequelize pre SQLite databázu,
// databáza bude uložená v súbore "database.sqlite" v koreňovom adresári.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // vypnúť logovanie SQL príkazov (voliteľné)
});

module.exports = sequelize;
