// src/config/dbConfig.js
const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost/food-court-order'; // Lokálna MongoDB inštalácia

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;
