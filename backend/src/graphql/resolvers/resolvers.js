// src/graphql/resolvers.js
import {requireAuth, requireRoles }from '../../auth/permissions.js'
import knex from '../../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export default {
  Query: {
    products: async () => {
      return knex('products').select('*').orderBy('created_at', 'desc');
    },


    getAllStaff: async (_, __, context) => {
      try {
        requireRoles(context,["admin","staff"]);
        const staffs = await knex('users')
          .select(
            'users.user_id',
            'users.email',
            'users.role',
            'users.created_at',
            knex.raw(`
              json_agg(
                DISTINCT jsonb_build_object(
                  'service_id', services.service_id,
                  'service_name', services.name
                )
              ) AS services
            `)
          )
          .leftJoin(
            'staff_availability',
            'users.user_id',
            'staff_availability.staff_id'
          )
          .leftJoin(
            'services',
            'staff_availability.service_id',
            'services.service_id'
          )
          .where('users.role', 'staff')
          .groupBy(
            'users.user_id',
            'users.email',
            'users.role',
            'users.created_at'
          )
          .orderBy('users.created_at', 'desc');

        return staffs;
      } catch (error) {
        throw new Error(error.message);
      }
    }
    ,
    product: async (_, { id }) => {
      return knex('products').where({ product_id:id }).first();
    },
    services: async () => {
      return knex('services').select('*').orderBy('created_at', 'desc');
    },
    service: async (_, { id }) => {
      return knex('services').where({service_id:id }).first();
    },
availableStaffs: async (_, { serviceId }) => {

  const rows = await knex("staff_availability as sa")
    .join("users as u", "sa.staff_id", "u.user_id")
    .join("services as s", "sa.service_id", "s.service_id")
    .where("sa.service_id", serviceId)
    .where("u.role", "staff")
    .select(
      "sa.slot_id as slot_id",
      "sa.start_time as startTime",
      "sa.end_time as endTime",

      "u.user_id as staffId",
      "u.email as staffEmail",
      "u.role as staffRole",

      "s.service_id as serviceId",
      "s.name as serviceName",
      "s.description as serviceDescription",
      "s.price as servicePrice",
      "s.duration_mins as durationMins",
      "s.capacity as capacity"

    );
console.log(rows);

  return rows.map(row => ({
    slot_id: row.slot_id,
    startTime: row.startTime,
    endTime: row.endTime,

    staff: {
      user_id: row.staffId,
      email: row.staffEmail,
      role: row.staffRole
    },

    service: {
      serviceId: row.serviceId,   // <-- changed
      name: row.serviceName,
      description: row.serviceDescription,
      price: row.servicePrice,
      durationMins: row.durationMins,
      capacity: row.capacity
    }
  }));
},
    viewCart: async (_, __, context) => {
      // Mocked user ID; normally extracted from auth context
      const userId = context.currentUser?.id || 1; 
      return await knex('cart_items')
        .where({ user_id: userId })
        .select('*');
    },

    myOrders: async (_, __, context) => {

     const userId = context.currentUser?.id || 1;

     const orders = await knex("orders")
        .where({
          user_id: userId
        })
        .orderBy("created_at", "desc");

      return orders;

},
myBookings: async(_,__,context)=>{
const userId = context.currentUser?.id;
console.log("my bookings userid : "+context.currentUser?.id)
const books = await knex("bookings").where({user_id:userId}).orderBy("created_at","desc");
return books ;

},

getBookings: async (_, __, context) => {
  requireRoles(context, ["admin","staff"]);

  try {
    const bookings = await knex("bookings")
      .join(
        "users as customer",
        "bookings.user_id",
        "customer.user_id"
      )
      .join(
        "staff_availability",
        "bookings.slot_id",
        "staff_availability.slot_id"
      )
      .join(
        "users as trainer",
        "staff_availability.staff_id",
        "trainer.user_id"
      )
      .join(
        "services",
        "staff_availability.service_id",
        "services.service_id"
      )
      .select(
        "bookings.booking_id",
        "customer.email as user_email",
        "services.name as service",
        "trainer.email as trainer",
        "staff_availability.start_time",
        "staff_availability.end_time",
        "bookings.booking_state",
        "bookings.payment_state"
      )
      .orderBy(
        "staff_availability.start_time",
        "asc"
      );


    return bookings.map((booking) => ({
      bookingId: booking.booking_id,
      userEmail: booking.user_email,
      service: booking.service,
      trainer: booking.trainer,
      startTime: booking.start_time,
      endTime: booking.end_time,
      bookingState: booking.booking_state,
      paymentState: booking.payment_state,
    }));

  } catch (error) {
    throw new Error(error.message);
  }
},
getStaffSchedule: async (_, __, context) => {
  requireRoles(context, ["admin","staff"]);

  try {
    return await knex("staff_availability")
      .join(
        "users",
        "staff_availability.staff_id",
        "users.user_id"
      )
      .join(
        "services",
        "staff_availability.service_id",
        "services.service_id"
      )
      .select(
        "staff_availability.slot_id as slotId",
        "users.user_id as staffId",
        "users.email as staff",
        "services.service_id as serviceId",
        "services.name as serviceName",
        "staff_availability.start_time as startTime",
        "staff_availability.end_time as endTime"
      )
      .orderBy("staff_availability.start_time", "asc")
      .orderBy("staff_availability.end_time", "asc");
  } catch (error) {
    throw new Error(error.message);
  }
}
    ,me: async (_, __, context) => {
      // Returns current user or throws an auth error
      return requireAuth(context);
    },
  },

  Mutation: {
    // --- Product Admin Mutations ---
    createProduct: async (_, { input }, context) => {
      requireRoles(context,["admin"]);
      if (input.price < 0) throw new UserInputError('Price cannot be negative');
      if (input.stock < 0) throw new UserInputError('Stock cannot be negative');

      const [newProduct] = await knex('products')
        .insert({
          name: input.name,
          description: input.description,
          price: input.price,
          stock_state: input.stock,
          image_url: input.imageUrl
        })
        .returning('*');
      return newProduct;
    },

    updateProduct: async (_, { id, input }, context) => {
      requireRoles(context,["admin"]);
      if (input.price < 0) throw new UserInputError('Price cannot be negative');
      if (input.stock < 0) throw new UserInputError('Stock cannot be negative');

      const [updatedProduct] = await knex('products')
        .where({ product_id:id})
        .update({
          name: input.name,
          description: input.description,
          price: input.price,
          stock_state: input.stock,
          image_url: input.imageUrl,
          updated_at: knex.fn.now()
        })
        .returning('*');

      if (!updatedProduct) throw new Error('Product not found');
      return updatedProduct;
    },

    deleteProduct: async (_, { id }, context) => {
      requireRoles(context,["admin"]);
      const deletedRows = await knex('products').where({ product_id:id }).del();
      return deletedRows > 0;
    },
    
    deleteBooking: async (_, { booking_id }, context) => {
        const user = context.currentUser?.id;
        const deletedRows = await knex('bookings').where({ booking_id:booking_id }).del();
        return deletedRows>0;


    }

    ,
    // --- Service Admin Mutations ---
addService: async (_, { input }, context) => {
  requireRoles(context, ["admin"]);

  try {
    const service = await knex("services")
      .insert({
        name: input.name,
        description: input.description,
        duration_mins: input.durationMins,
        price: input.price,
        capacity: input.capacity,
      })
      .returning("*");

    return {
      serviceId: service[0].service_id,
      name: service[0].name,
      description: service[0].description,
      durationMins: service[0].duration_mins,
      price: service[0].price,
      capacity: service[0].capacity,
      createdAt: service[0].created_at,
      updatedAt: service[0].updated_at,
    };
  } catch (err) {
    throw new Error(err.message);
  }
},
updateService: async (_, { id, input }, context) => {
  requireRoles(context, ["admin"]);

  try {
    const exists = await knex("services")
      .where({ service_id: id })
      .first();

    if (!exists) {
      throw new Error("Service not found");
    }

    const updated = await knex("services")
      .where({ service_id: id })
      .update({
        name: input.name,
        description: input.description,
        duration_mins: input.durationMins,
        price: input.price,
        capacity: input.capacity,
        updated_at: knex.fn.now(),
      })
      .returning("*");

    return {
      serviceId: updated[0].service_id,
      name: updated[0].name,
      description: updated[0].description,
      durationMins: updated[0].duration_mins,
      price: updated[0].price,
      capacity: updated[0].capacity,
      createdAt: updated[0].created_at,
      updatedAt: updated[0].updated_at,
    };
  } catch (err) {
    throw new Error(err.message);
  }
},
deleteService: async (_, { service_id }, context) => {
  requireRoles(context, ["admin"]);

  try {
    const exists = await knex("services")
      .where({ service_id: service_id })
      .first();

    if (!exists) {
      throw new Error("Service not found");
    }

    await knex("services")
      .where({ service_id: service_id })
      .del();

    return true;
  } catch (err) {
    throw new Error(err.message);
  }
},

    updateService: async (_, { service_id, input }, context) => {
      requireRoles(context,["admin"]);
      if (input.price < 0) throw new UserInputError('Price cannot be negative');

      const [updatedService] = await knex('services')
        .where({ service_id })
        .update({
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
          capacity: input.capacity,
          updated_at: knex.fn.now()
        })
        .returning('*');

      if (!updatedService) throw new Error('Service not found');
      return updatedService;
    },


  
addToCart: async (_, { productId }, context) => {

  const userId = context.currentUser?.id || 1;

  const quantityToAdd = 1;


  const [item] = await knex('cart_items')
    .insert({
      user_id: userId,
      product_id: productId,
      quantity: quantityToAdd
    })
    .onConflict(['user_id', 'product_id'])
    .merge({
      quantity: knex.raw(
        'cart_items.quantity + 1'
      )
    })
    .returning('*');


  return item;

},removeFromCart: async (_, { productId }, { currentUser }) => {

  const userId = currentUser?.id || 1;

  const item = await knex("cart_items")
    .where({
      user_id: userId,
      product_id: productId
    })
    .first();

  if (!item) {
    throw new Error("Item not found in cart.");
  }

  if (item.quantity === 1) {
    await knex("cart_items")
      .where({
        user_id: userId,
        product_id: productId
      })
      .del();

    return {
      product_id: productId,
      quantity: 0
    };
  }

  const [updatedItem] = await knex("cart_items")
    .where({
      user_id: userId,
      product_id: productId
    })
    .update({
      quantity: knex.raw("quantity - 1")
    })
    .returning("*");

  return updatedItem;

},checkout: async (_, __, { currentUser }) => {

  const userId = currentUser?.id || 1;

  return await knex.transaction(async (trx) => {

    // Get all cart items with current product prices
    const cartItems = await knex("cart_items")
      .join("products", "cart_items.product_id", "products.product_id")
      .select(
        "cart_items.product_id",
        "cart_items.quantity",
        "products.price"
      )
      .where("cart_items.user_id", userId);

    if (cartItems.length === 0) {
      throw new Error("Your cart is empty.");
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Create order
    const [order] = await knex("orders")
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        order_state: "pending",
        payment_state: "Unpaid"
      })
      .returning("*");

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    await knex("order_items").insert(orderItems);

    // Clear cart
    await knex("cart_items")
      .where({ user_id: userId })
      .del();

    return order;

  });

},
cancelOrder: async (_, { orderId }, context) => {

  const userId = context.currentUser?.id || 1;

  // Find the user's order
  const order = await knex("orders")
    .where({
      order_id: orderId,
      user_id: userId
    })
    .first();

  if (!order) {
    throw new Error("Order not found.");
  }


  // Only pending orders can be cancelled
  if (order.order_state !== "pending") {
    throw new Error(
      "Only pending orders can be cancelled."
    );
  }


  const [updatedOrder] = await knex("orders")
    .where({
      order_id: orderId,
      user_id: userId
    })
    .update({
      order_state: "cancelled"
    })
    .returning("*");


  return updatedOrder;
}
,

createBooking: async (_, { slotId }, context) => {
  console.log(context.currentUser);
const user = context.currentUser?.id;
  if (!user) {
    throw new Error("Authentication required");
  }


  return await knex.transaction(async trx => {

    // Get slot + service capacity
    const slot = await trx("staff_availability as sa")
      .join("services as s", "sa.service_id", "s.service_id")
      .where("sa.slot_id", slotId)
      .select(
        "sa.slot_id",
        "sa.service_id",
        "s.capacity"
      )
      .forUpdate()
      .first();


    if (!slot) {
      throw new Error("Slot not found");
    }


    // Prevent same customer booking same service twice
    const duplicate = await trx("bookings as b")
      .join(
        "staff_availability as sa",
        "b.slot_id",
        "sa.slot_id"
      )
      .where("b.user_id", user)
      .where("sa.service_id", slot?.service_id)
      .whereNot("b.booking_state", "cancelled")
      .first();


    if (duplicate) {
      throw new Error("You already booked this service");
    }



    // Capacity check
    const result = await trx("bookings")
      .where("slot_id", slotId)
      .whereNot("booking_state", "cancelled")
      .count("* as total");


    if (Number(result[0].total) >= slot.capacity) {
      throw new Error("This slot is full");
    }



    const [booking] = await trx("bookings")
      .insert({
        user_id: user,
        slot_id: slotId,
        booking_state: "pending",
        payment_state: "Unpaid"
      })
      .returning("*");


    return booking;

  });

},
 assignStaffService : async (_, { input }, context) => {
       requireRoles(context,["admin"]);
       try{
  const {
    staffId,
    serviceId,
    startTime,
    endTime
  } = input;

  console.log(input);


  return await knex.transaction(async (trx) => {

    // Check that user exists and is staff
    const user = await trx('users')
      .where({
        user_id: staffId,
        role: 'customer'
      })
      .first();


    if (!user) {
      throw new Error("user not found");
    }

          // 2. Change role to staff if needed
      if (user.role !== "staff") {
        await trx('users')
          .where({
            user_id: staffId
          })
          .update({
            role: "staff"
          });
      }


    // Check service exists
    const service = await trx('services')
      .where({
        service_id: serviceId
      })
      .first();


    if (!service) {
      throw new Error("Service not found");
    }


    // Add availability
    await trx('staff_availability')
      .insert({
        staff_id: staffId,
        service_id: serviceId,
        start_time: startTime,
        end_time: endTime
      });


    // Return created data
    const result = await trx('staff_availability')
      .join(
        'users',
        'staff_availability.staff_id',
        'users.user_id'
      )
      .join(
        'services',
        'staff_availability.service_id',
        'services.service_id'
      )
      .where(
        'staff_availability.staff_id',
        staffId
      )
      .orderBy(
        'staff_availability.slot_id',
        'desc'
      )
      .select(
        'users.user_id as staffId',
        'users.email',
        'services.name as serviceName',
        'staff_availability.start_time as startTime',
        'staff_availability.end_time as endTime'
      )
      .first();


    return result;


  });
        }catch (error) {
        throw new Error(error.message);
      }
}
,

updateStaffAvailability: async (_, { input }, context) => {
  requireRoles(context, ["admin"]);

  const {
    slotId,
    staffId,
    serviceId,
    startTime,
    endTime
  } = input;
  console.log(input)

  try {
    return await knex.transaction(async (trx) => {

      // Check staff exists
      const staff = await trx("users")
        .where({
          user_id: staffId,
          role: "staff"
        })
        .first();

      if (!staff) {
        throw new Error("Staff not found");
      }


      // Check service exists
      const service = await trx("services")
        .where({
          service_id: serviceId
        })
        .first();

      if (!service) {
        throw new Error("Service not found");
      }


      // Check if slot exists
      const existingSlot = await trx("staff_availability")
        .where({
          slot_id: slotId
        })
        .first();


      if (existingSlot) {

        // Update existing slot
        await trx("staff_availability")
          .where({
            slot_id: slotId
          })
          .update({
            staff_id: staffId,
            service_id: serviceId,
            start_time: startTime,
            end_time: endTime
          });

      } else {

        // Create new slot
        await trx("staff_availability")
          .insert({
            staff_id: staffId,
            service_id: serviceId,
            start_time: startTime,
            end_time: endTime
          });
      }


      // Return updated/created slot
      return await trx("staff_availability")
        .join(
          "users",
          "staff_availability.staff_id",
          "users.user_id"
        )
        .join(
          "services",
          "staff_availability.service_id",
          "services.service_id"
        )
        .where({
          "staff_availability.staff_id": staffId
        })
        .orderBy(
          "staff_availability.slot_id",
          "desc"
        )
        .select(
          "staff_availability.slot_id as slotId",
          "users.user_id as staffId",
          "users.email",
          "services.service_id as serviceId",
          "services.name as serviceName",
          "staff_availability.start_time as startTime",
          "staff_availability.end_time as endTime"
        )
        .first();

    });

  } catch (error) {
    throw new Error(error.message);
  }
}
,

addStaffAvailability: async (_, { input }, context) => {
  requireRoles(context, ["admin"]);

  const {
    staffId,
    serviceId,
    startTime,
    endTime
  } = input;

  try {
    return await knex.transaction(async (trx) => {

      // Check staff exists
      const staff = await trx("users")
        .where({
          user_id: staffId,
          role: "staff"
        })
        .first();

      if (!staff) {
        throw new Error("Staff not found");
      }


      // Check service exists
      const service = await trx("services")
        .where({
          service_id: serviceId
        })
        .first();

      if (!service) {
        throw new Error("Service not found");
      }


      // Insert new availability slot
      const [slot] = await trx("staff_availability")
        .insert({
          staff_id: staffId,
          service_id: serviceId,
          start_time: startTime,
          end_time: endTime
        })
        .returning("*");


      // Return complete data
      return await trx("staff_availability")
        .join(
          "users",
          "staff_availability.staff_id",
          "users.user_id"
        )
        .join(
          "services",
          "staff_availability.service_id",
          "services.service_id"
        )
        .where({
          "staff_availability.slot_id": slot.slot_id
        })
        .select(
          "staff_availability.slot_id as slotId",
          "users.user_id as staffId",
          "users.email",
          "services.service_id as serviceId",
          "services.name as serviceName",
          "staff_availability.start_time as startTime",
          "staff_availability.end_time as endTime"
        )
        .first();

    });

  } catch (error) {
    throw new Error(error.message);
  }
}
,
deleteStaffAvailability: async (_, { slotId }, context) => {
  requireRoles(context, ["admin"]);

  try {

    const deleted = await knex("staff_availability")
      .where({
        slot_id: slotId
      })
      .del();


    if (!deleted) {
      throw new Error("Availability slot not found");
    }


    return true;

  } catch (error) {
    throw new Error(error.message);
  }
}
,
removeStaff: async (_, { staffId }, context) => {
  requireRoles(context, ["admin"]);

  try {
    return await knex.transaction(async (trx) => {
      // Check user exists
      const user = await trx("users")
        .where({ user_id: staffId })
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Remove all assigned services/availability
      await trx("staff_availability")
        .where({ staff_id: staffId })
        .del();

      // Change role back to customer
      await trx("users")
        .where({ user_id: staffId })
        .update({
          role: "customer"
        });

      return true;
    });
  } catch (error) {
    throw new Error(error.message);
  }
},
updateBooking: async (_, { bookingId, input }, context) => {
  const { bookingState, paymentState } = input;

  const updated = await knex("bookings")
    .where({ booking_id: bookingId })
    .update({
      ...(bookingState && { booking_state: bookingState }),
      ...(paymentState && { payment_state: paymentState }),
    })
    .returning([
      "booking_id",
      "user_id",
      "slot_id",
      "booking_state",
      "payment_state",
      "created_at",
    ]);

  if (updated.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = updated[0];

  return {
    bookingId: booking.booking_id,
    userId: booking.user_id,
    slotId: booking.slot_id,
    bookingState: booking.booking_state,
    paymentState: booking.payment_state,
    createdAt: booking.created_at,
  };
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
      const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
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

  // Map snake_case db columns to camelCase GraphQL fields
  Product: {
    imageUrl: (parent) => parent.image_url,
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
    stockState: (parent) => parent.stock_state,
    productId : (parent) => parent.product_id

  },
// Service: {
//     serviceId: (parent) => parent.service_id,
//     durationMins: (parent) => parent.duration_mins,
//     createdAt: (parent) => parent.created_at,
//     updatedAt: (parent) => parent.updated_at,
// },
 Service: {
  serviceId: (parent) =>
    parent.service_id ?? parent.serviceId,

  name: (parent) =>
    parent.name ?? parent.serviceName,

  description: (parent) =>
    parent.description ?? parent.serviceDescription,

  price: (parent) =>
    parent.price ?? parent.servicePrice,

  durationMins: (parent) =>
    parent.duration_mins ?? parent.durationMins,

  capacity: (parent) =>
    parent.capacity ?? parent.serviceCapacity,
},

  // Relationship Resolvers (How GraphQL nests types dynamically)
  CartItem: {
    product: async (parent, __, { db }) => {
      return await knex('products').where({ product_id: parent.product_id }).first();
    }
  },

    Order: {
    orderId: (order) => order.order_id,
    totalAmount: (order) => order.total_amount,
    orderState: (order) => order.order_state,
    paymentState: (order) => order.payment_state,
    createdAt: (order) => order.created_at,
    items: async (order) => {

    return await knex("order_items")
      .where({
        order_id: order.order_id
      });

  }

  }
,
  OrderItem: {
  orderItemId: (item) => item.order_item_id,
  orderId: (item) => item.order_id,
  unitPrice: (item) => item.unit_price,
  product: async (item) => {
    return await knex("products")
      .where({ product_id: item.product_id })
      .first();
  }
},


Booking_By_ID: {
  bookingId: (parent) => parent.booking_id,
  bookingState: (parent) => parent.booking_state,
  paymentState: (parent) => parent.payment_state,
  createdAt: (parent) => parent.created_at,

  user: async (parent) => {
    return await knex("users")
      .where({ user_id: parent.user_id })
      .first();
  },

  slot: async (parent) => {
    return await knex("staff_availability")
      .where({ slot_id: parent.slot_id })
      .first();
  },

},

staff_table_attributes: {
  slot_id: p => p.slot_id,
  start_time: p => p.start_time,
  end_time: p => p.end_time,

  staff: async p =>
    knex("users").where({ user_id: p.staff_id }).first(),

  service: async p =>
    knex("services").where({ service_id: p.service_id }).first(),
},

Booking: {
  bookingState: (parent) => parent.booking_state,
  paymentState: (parent) => parent.payment_state,
  createdAt: (parent) => parent.created_at,

  user: async (parent) => {
    return await knex("users")
      .where({ user_id: parent.user_id })
      .first();
  },

  slot: async (parent) => {
    return await knex("staff_availability")
      .where({ slot_id: parent.slot_id })
      .first();
  },

},

StaffAvailability: {
  slot_id: parent => parent.slot_id,
  startTime: parent => parent.startTime,
  endTime: parent => parent.endTime,

  staff: parent => parent.staff,
  service: parent => parent.service,
},


};