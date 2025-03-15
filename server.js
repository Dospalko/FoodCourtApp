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
global.io = io;
const cors = require('cors');
app.use(cors());


app.use(express.json());
app.get('/', (req, res) => {
  res.send('Food Court Order API is running with SQL database!');
});

// Pridáme routu pre notifikácie
const notificationRoutes = require(path.join(__dirname, 'src', 'routes', 'notificationRoutes'));
app.use('/notifications', notificationRoutes);

// GraphQL schéma
const typeDefs = gql`
  type Order {
    id: ID!
    items: [String!]!
    totalAmount: Float!
    pickupTime: String!
    status: String!
    customerAuthToken: String!
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
    createOrder(items: [String!]!, totalAmount: Float!, pickupTime: String!, customerAuthToken: String!): Order
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
    createOrder: async (_, { items, totalAmount, pickupTime, customerAuthToken }) => {
      try {
        const newOrder = await Order.create({ items, totalAmount, pickupTime, customerAuthToken });
        // Ak objednávka prichádza od zákazníka, upozorníme restauráciu
        global.io.to('restaurant').emit('orderStatus', newOrder);
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
        // Ak aktualizácia prichádza zo strany restaurácie, vytvoríme notifikáciu pre zákazníka
        if (role === 'restaurant' && updatedOrder.customerAuthToken) {
          const Notification = require('./src/models/Notification');
          await Notification.create({
            authToken: updatedOrder.customerAuthToken,
            message: `Your order ID ${updatedOrder.id} is now ${updatedOrder.status}`,
            type: 'update',
            orderId: updatedOrder.id.toString()
          });
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
        // Vytvoríme notifikáciu o vymazaní, ak je objednávka spojená so zákazníkom
        if (deletedOrder && deletedOrder.customerAuthToken) {
          const Notification = require('./src/models/Notification');
          await Notification.create({
            authToken: deletedOrder.customerAuthToken,
            message: `Your order ID ${deletedOrder.id} has been deleted`,
            type: 'deleted',
            orderId: deletedOrder.id.toString()
          });
        }
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
      // Pre vývoj: force sync vymaže a vytvorí tabuľky odznova
      await sequelize.sync({ force: true });
      console.log('Databáza SQL synchronizovaná (force sync)');
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
  
