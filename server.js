const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { ApolloServer, gql } = require('apollo-server-express');

// Načítanie MongoDB cez Mongoose (dbConfig.js sa postará o pripojenie)
require('./src/config/dbConfig');

// Načítanie modelov
const Order = require('./src/models/Order');
const Notification = require('./src/models/Notification');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
global.io = io;

app.use(express.json());
app.use(require('cors')()); // Povolenie CORS

// Testovacia routa
app.get('/', (req, res) => {
  res.send('Food Court Order API is running with MongoDB!');
});

// REST routa pre notifikácie
const notificationRoutes = require('./src/routes/notificationRoutes');
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

  type Notification {
    id: ID!
    authToken: String!
    message: String!
    type: String!
    orderId: String!
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
        return await Order.find();
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
        // Vytvor notifikáciu pre restauráciu
        await Notification.create({
          authToken: "restaurant",
          message: `New order received: ID ${newOrder._id}`,
          type: 'new',
          orderId: newOrder._id.toString()
        });
        global.io.to('restaurant').emit('orderStatus', newOrder);
        return newOrder;
      } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Error creating order');
      }
    },
    updateOrder: async (_, { id, updates, role }) => {
      try {
        const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
        if (role === 'restaurant') {
          // Notifikácia pre zákazníka
          await Notification.create({
            authToken: updatedOrder.customerAuthToken,
            message: `Your order ID ${updatedOrder._id} is now ${updatedOrder.status}`,
            type: 'update',
            orderId: updatedOrder._id.toString()
          });
          global.io.to('customer').emit('orderUpdate', updatedOrder);
        } else if (role === 'customer') {
          // Notifikácia pre restauráciu
          await Notification.create({
            authToken: "restaurant",
            message: `Order ID ${updatedOrder._id} updated by customer: now ${updatedOrder.status}`,
            type: 'update',
            orderId: updatedOrder._id.toString()
          });
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
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (deletedOrder) {
          await Notification.create({
            authToken: deletedOrder.customerAuthToken,
            message: `Your order ID ${deletedOrder._id} has been deleted`,
            type: 'deleted',
            orderId: deletedOrder._id.toString()
          });
          await Notification.create({
            authToken: "restaurant",
            message: `Order ID ${deletedOrder._id} has been deleted by customer`,
            type: 'deleted',
            orderId: deletedOrder._id.toString()
          });
          global.io.emit('orderDeleted', deletedOrder);
        }
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

startApolloServer();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
