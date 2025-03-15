// src/config/dbConfig.js

const mongoose = require('mongoose');

// Pripojíme sa k MongoDB databáze (uprav URL podľa svojho prostredia)
mongoose.connect('mongodb://localhost/food-court-order', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Chyba pripojenia k databáze:'));
db.once('open', () => {
    console.log('Pripojené k MongoDB');
});

module.exports = db;
