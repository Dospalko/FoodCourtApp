// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { ApolloServer, gql } = require('apollo-server-express');

// Načítanie SQL databázy cez Sequelize
const sequelize = require('./src/config/dbConfig');
// Načítanie modelu Order
const Order = require('./src/models/Order');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Uložíme io globálne, aby ho mohli používať resolvery
global.io = io;

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Food Court Order API is running with SQL database!');
});

// REST routy – (môžete pridať neskôr)
// app.use('/orders', orderRoutes);

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

const resolvers = {
  Query: {
    orders: async () => {
      try {
        return await Order.findAll();
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    }
  },
  Mutation: {
    createOrder: async (_, { items, totalAmount, pickupTime }) => {
      try {
        const newOrder = await Order.create({ items, totalAmount, pickupTime });
        global.io.emit('orderStatus', newOrder);
        return newOrder;
      } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Error creating order');
      }
    },
    updateOrder: async (_, { id, updates, role }) => {
      try {
        await Order.update(updates, { where: { id } });
        const updatedOrder = await Order.findByPk(id);
        if (role === 'restaurant') {
          global.io.to('customer').emit('orderUpdate', updatedOrder);
        } else if (role === 'customer') {
          global.io.to('restaurant').emit('orderUpdate', updatedOrder);
        } else {
          global.io.emit('orderUpdate', updatedOrder);
        }
        return updatedOrder;
      } catch (error) {
        console.error('Error updating order:', error);
        throw new Error('Error updating order');
      }
    },
    deleteOrder: async (_, { id }) => {
      try {
        const deletedOrder = await Order.findByPk(id);
        await Order.destroy({ where: { id } });
        global.io.emit('orderDeleted', deletedOrder);
        return deletedOrder;
      } catch (error) {
        console.error('Error deleting order:', error);
        throw new Error('Error deleting order');
      }
    }
  }
};

async function startApolloServer() {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
}

async function init() {
  try {
    // Synchronizácia modelov – vytvorí tabuľky ak neexistujú
    await sequelize.sync();
    console.log('Databáza SQL synchronizovaná');
    await startApolloServer();
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

init();
