// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { ApolloServer, gql } = require('apollo-server-express');

// Pre túto fázu nepoužívame MongoDB – dbConfig môže byť prázdny
// Prequire('./src/config/dbConfig');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Middleware pre parsovanie JSON
app.use(express.json());

// Testovacia routa
app.get('/', (req, res) => {
  res.send('Food Court Order API is running!');
});

// REST routy pre objednávky
const orderRoutes = require(path.join(__dirname, 'src', 'routes', 'orderRoutes'));
app.use('/orders', orderRoutes);

// GraphQL schéma a resolvery
const typeDefs = gql`
  type Order {
    id: ID!
    items: [String!]!
    totalAmount: Float!
    pickupTime: String!
    status: String!
  }

  type Query {
    orders: [Order]
  }

  type Mutation {
    createOrder(items: [String!]!, totalAmount: Float!, pickupTime: String!): Order
  }
`;

// Používame in-memory repozitár (v src/data/orderRepository.js)
const orderRepository = require('./src/data/orderRepository');

const resolvers = {
  Query: {
    orders: () => orderRepository.getAllOrders()
  },
  Mutation: {
    createOrder: (_, { items, totalAmount, pickupTime }) => {
      const newOrder = orderRepository.createOrder({ items, totalAmount, pickupTime });
      // Emitovanie notifikácie cez Socket.io pre real-time update
      io.emit('orderStatus', newOrder);
      return newOrder;
    }
  }
};

async function startApolloServer() {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
}

startApolloServer();

// Socket.io logika
const orderSocket = require(path.join(__dirname, 'src', 'sockets', 'orderSocket'));
orderSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
