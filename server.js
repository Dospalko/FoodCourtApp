// server.js

// Import základných modulov
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Inicializácia Express aplikácie
const app = express();

// Vytvorenie HTTP servera
const server = http.createServer(app);

// Inicializácia Socket.io s povoleným CORS
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

// Middleware na spracovanie JSON dát
app.use(express.json());

// Testovacia routa
app.get('/', (req, res) => {
    res.send('Food Court Order API beží!');
});

// Importovanie a použitie routy pre objednávky
const orderRoutes = require(path.join(__dirname, 'src', 'routes', 'orderRoutes'));
app.use('/orders', orderRoutes);

// Import a inicializácia Socket.io logiky z orderSocket.js
const orderSocket = require(path.join(__dirname, 'src', 'sockets', 'orderSocket'));
orderSocket(io);

// Spustenie servera na porte 3000 (alebo z env premennej PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server beží na porte ${PORT}`);
});
