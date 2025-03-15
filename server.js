// Importujeme potrebné moduly: Express, HTTP a Socket.io
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Inicializujeme Express aplikáciu
const app = express();

// Vytvoríme HTTP server, ktorý bude využitý aj pre Socket.io
const server = http.createServer(app);

// Inicializácia Socket.io s nastavením CORS pre jednoduchý vývoj (povolený prístup z akejkoľvek domény)
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

// Middleware pre spracovanie JSON requestov
app.use(express.json());

// Testovacia routa, ktorá overí, že server beží
app.get('/', (req, res) => {
    res.send('Food Court Order API beží!');
});

// Socket.io logika pre real-time komunikáciu
io.on('connection', (socket) => {
    console.log('Nový klient pripojený:', socket.id);

    // Príklad eventu: klient pošle aktualizáciu objednávky
    socket.on('orderUpdate', (data) => {
        console.log('Prijatá aktualizácia objednávky:', data);
        // Emisia stavu objednávky všetkým pripojeným klientom
        io.emit('orderStatus', data);
    });

    // Keď sa klient odpojí, vypíšeme jeho ID
    socket.on('disconnect', () => {
        console.log('Klient sa odpojil:', socket.id);
    });
});

// Nastavenie portu pre server (defaultne 3000)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server beží na porte ${PORT}`);
});
