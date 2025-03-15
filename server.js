// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { ApolloServer, gql } = require('apollo-server-express');

// Pre túto fázu nepoužívame MongoDB – dbConfig môže byť prázdny
// require('./src/config/dbConfig');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Nastavíme globálnu premennú pre Socket.io, aby ju vedeli využívať aj GraphQL resolvery
global.io = io;

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

  input OrderUpdateInput {
    items: [String]
    totalAmount: Float
    pickupTime: String
    status: String
  }

  type Query {
    orders: [Order]
  }

  type Mutation {
    createOrder(items: [String!]!, totalAmount: Float!, pickupTime: String!): Order
    updateOrder(id: ID!, updates: OrderUpdateInput!, role: String!): Order
    deleteOrder(id: ID!): Order
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
      // Vysielame notifikáciu pre všetkých klientov
      global.io.emit('orderStatus', newOrder);
      return newOrder;
    },
    updateOrder: (_, { id, updates, role }) => {
      const updatedOrder = orderRepository.updateOrder({ id, updates });
      // Na základe role (restaurant alebo customer) posielame notifikácie do konkrétnych rooms
      if (role === 'restaurant') {
        global.io.to('customer').emit('orderUpdate', updatedOrder);
      } else if (role === 'customer') {
        global.io.to('restaurant').emit('orderUpdate', updatedOrder);
      } else {
        // Ak nie je špecifikovaná role, vysielame všetkým
        global.io.emit('orderUpdate', updatedOrder);
      }
      return updatedOrder;
    },
    deleteOrder: (_, { id }) => {
      const deletedOrder = orderRepository.deleteOrder(id);
      global.io.emit('orderDeleted', deletedOrder);
      return deletedOrder;
    }
  }
};

async function startApolloServer() {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
}

startApolloServer();

// Socket.io logika (rooms, eventy)
const orderSocket = require(path.join(__dirname, 'src', 'sockets', 'orderSocket'));
orderSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
