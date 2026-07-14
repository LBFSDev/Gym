// src/graphql/resolvers.js
import {requireAuth }from '../../auth/permissions.js'
import knex from '../../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export default {
  Query: {
    products: async (_, __, { db }) => {
      return await db('products').select('*');
    },

    viewCart: async (_, __, { db, currentUser }) => {
      // Mocked user ID; normally extracted from auth context
      const userId = currentUser?.id || 1; 
      return await db('cart_items')
        .where({ user_id: userId })
        .select('*');
    },

    myOrders: async (_, __, { db, currentUser }) => {
      const userId = currentUser?.id || 1;
      return await db('orders').where({ user_id: userId }).select('*');
    }
    ,me: async (_, __, context) => {
      // Returns current user or throws an auth error
      return requireAuth(context);
    },
  },

  Mutation: {
    addToCart: async (_, { productId, quantity }, { db, currentUser }) => {
      const userId = currentUser?.id || 1;

      // Upsert into cart
      const [item] = await db('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity })
        .onConflict(['user_id', 'product_id'])
        .merge({ quantity: db.raw('cart_items.quantity + EXCLUDED.quantity') })
        .returning('*');

      return item;
    },

    createBooking: async (_, { slotId }, { db, currentUser }) => {
      const userId = currentUser?.id || 1;

      // PostgreSQL database-level unique index (from our schema step) and trigger 
      // will handle the hard checks (no double booking, capacity limits).
      // We wrap it in a try-catch to display the Postgres error nicely to the user.
      try {
        const [booking] = await db('bookings')
          .insert({
            user_id: userId,
            slot_id: slotId,
            booking_state: 'pending',
            payment_state: 'Unpaid'
          })
          .returning('*');
        return booking;
      } catch (error) {
        throw new Error(`Booking failed: ${error.message}`);
      }
    },
    register: async (_, { email, password, role = 'customer' }) => {
      // 1. Check if email exists
      const existingUser = await knex('users').where({ email }).first();
      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }

      // 2. Hash Password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // 3. Save User to Postgres
      const [newUser] = await knex('users')
        .insert({
          email,
          password_hash: passwordHash,
          role,
          created_at: new Date(),
        })
        .returning(['user_id', 'email', 'role']);

      // 4. Create Token
      const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        token,
        user: newUser,
      };
    },
    login: async (_, { email, password }) => {
      // 1. Find User
      const user = await knex('users').where({ email }).first();
      if (!user) {
        throw new Error('Invalid email or password.');
      }

      // 2. Compare Hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      // 3. Create Token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        token,
        user: {
          email: user.email,
          role: user.role,
        },
      };
    },
  },

  // Relationship Resolvers (How GraphQL nests types dynamically)
  CartItem: {
    product: async (parent, __, { db }) => {
      return await db('products').where({ product_id: parent.product_id }).first();
    }
  },

  Order: {
    items: async (parent, __, { db }) => {
      return await db('order_items').where({ order_id: parent.order_id }).select('*');
    }
  },

  OrderItem: {
    product: async (parent, __, { db }) => {
      return await db('products').where({ product_id: parent.product_id }).first();
    }
  }
};