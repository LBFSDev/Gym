// src/graphql/resolvers.js
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
    }
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