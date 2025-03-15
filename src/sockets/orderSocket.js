// src/sockets/orderSocket.js

/**
 * Tento modul nastavuje Socket.io eventy pre objednávky.
 */
module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('Socket pripojený:', socket.id);

        // Príklad eventu: ak klient pošle aktualizáciu objednávky
        socket.on('orderUpdate', (data) => {
            console.log('Aktualizácia objednávky:', data);
            // Emisia aktualizovaného stavu objednávky všetkým klientom
            io.emit('orderStatus', data);
        });

        // Event, keď sa klient odpojí
        socket.on('disconnect', () => {
            console.log('Socket odpojený:', socket.id);
        });
    });
};
