// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { ApolloServer, gql } = require('apollo-server-express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Načítanie MongoDB cez Mongoose (dbConfig.js zabezpečí pripojenie)
require('./src/config/dbConfig');

// Načítanie modelov
const Order = require('./src/models/Order');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');

const JWT_SECRET = 'your_jwt_secret_key';

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
global.io = io;

app.use(express.json());
app.use(cors());

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
    restaurantAuthToken: String!
  }

  type Notification {
    id: ID!
    authToken: String!
    message: String!
    type: String!
    orderId: String!
  }

  type User {
    id: ID!
    email: String!
    role: String!
    token: String
  }

  input OrderUpdateInput {
    items: [String]
    totalAmount: Float
    pickupTime: String
    status: String
  }

  input RegisterInput {
    email: String!
    password: String!
    role: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    orders: [Order]
    ordersByRestaurant(restaurantAuthToken: String!): [Order]
    restaurants: [User]
  }

  type Mutation {
    createOrder(
      items: [String!]!,
      totalAmount: Float!,
      pickupTime: String!,
      customerAuthToken: String!,
      restaurantAuthToken: String!
    ): Order
    updateOrder(id: ID!, updates: OrderUpdateInput!, role: String!): Order
    deleteOrder(id: ID!): Order
    registerUser(input: RegisterInput!): User
    loginUser(input: LoginInput!): User
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
    },
    ordersByRestaurant: async (_, { restaurantAuthToken }) => {
      try {
        return await Order.find({ restaurantAuthToken });
      } catch (error) {
        console.error('Error fetching orders by restaurant:', error);
        return [];
      }
    },
    restaurants: async () => {
      try {
        return await User.find({ role: "restaurant" });
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }
    }
  },
  Mutation: {
    createOrder: async (_, { items, totalAmount, pickupTime, customerAuthToken, restaurantAuthToken }) => {
      try {
        const newOrder = await Order.create({ items, totalAmount, pickupTime, customerAuthToken, restaurantAuthToken });
        // Vytvor notifikáciu pre vybranú restauráciu
        await Notification.create({
          authToken: restaurantAuthToken,
          message: `New order received: ID ${newOrder._id}`,
          type: 'new',
          orderId: newOrder._id.toString()
        });
        global.io.to(restaurantAuthToken).emit('orderStatus', newOrder);
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
          await Notification.create({
            authToken: updatedOrder.customerAuthToken,
            message: `Your order ID ${updatedOrder._id} is now ${updatedOrder.status}`,
            type: 'update',
            orderId: updatedOrder._id.toString()
          });
          global.io.to(updatedOrder.customerAuthToken).emit('orderUpdate', updatedOrder);
        } else if (role === 'customer') {
          await Notification.create({
            authToken: updatedOrder.restaurantAuthToken,
            message: `Order ID ${updatedOrder._id} updated by customer: now ${updatedOrder.status}`,
            type: 'update',
            orderId: updatedOrder._id.toString()
          });
          global.io.to(updatedOrder.restaurantAuthToken).emit('orderUpdate', updatedOrder);
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
            authToken: deletedOrder.restaurantAuthToken,
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
    },
    registerUser: async (_, { input }) => {
      const { email, password, role } = input;
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, role });
        const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
        return { id: newUser._id, email: newUser.email, role: newUser.role, token };
      } catch (error) {
        console.error('Error registering user:', error);
        throw new Error('Error registering user');
      }
    },
    loginUser: async (_, { input }) => {
      const { email, password } = input;
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return { id: user._id, email: user.email, role: user.role, token };
      } catch (error) {
        console.error('Error logging in:', error);
        throw new Error('Error logging in');
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
