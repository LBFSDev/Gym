// src/db/migrations/[timestamp]_create_gym_tables.js

//exports.up = async function(knex) {
export async function up(knex) {
  // 1. Create ENUMs using raw SQL since Knex doesn't have built-in Postgres native enum syntax
  await knex.raw(`CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');`);
  await knex.raw(`CREATE TYPE stock_status AS ENUM ('In Stock', 'Out of Stock', 'Low Stock');`);
  await knex.raw(`CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');`);
  await knex.raw(`CREATE TYPE payment_status AS ENUM ('Unpaid', 'Paid');`);
  await knex.raw(`CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');`);

  // 2. Core Users Table
  await knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary(); // Generates auto-incrementing identity
    table.string('email', 100).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.specificType('role', 'user_role').notNullable().defaultTo('customer');
    table.timestamps(true, true); // created_at and updated_at
  });

  // 3. Products Table
  await knex.schema.createTable('products', (table) => {
    table.increments('product_id').primary();
    table.string('name', 100).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.specificType('stock_state', 'stock_status').notNullable().defaultTo('In Stock');
    table.string('image_url', 255);
    table.timestamps(true, true);
  });

  // 4. Cart Items Table
  await knex.schema.createTable('cart_items', (table) => {
    table.integer('user_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.integer('product_id').unsigned().notNullable().references('product_id').inTable('products').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(1);
    table.primary(['user_id', 'product_id']);
  });

  // 5. Orders Table
  await knex.schema.createTable('orders', (table) => {
    table.increments('order_id').primary();
    table.integer('user_id').unsigned().references('user_id').inTable('users');
    table.decimal('total_amount', 10, 2).notNullable();
    table.specificType('order_state', 'order_status').notNullable().defaultTo('pending');
    table.specificType('payment_state', 'payment_status').notNullable().defaultTo('Unpaid');
    table.timestamps(true, true);
  });

  // >>> ADD THIS NEW TABLE HERE <<<
// 5b. Order Items Table (Junction table)
await knex.schema.createTable('order_items', (table) => {
  table.increments('order_item_id').primary();
  table.integer('order_id')
    .unsigned()
    .notNullable()
    .references('order_id')
    .inTable('orders')
    .onDelete('CASCADE');
  table.integer('product_id')
    .unsigned()
    .references('product_id')
    .inTable('products')
    .onDelete('SET NULL'); // Keeps the order history even if a product is deleted
  table.integer('quantity').notNullable().defaultTo(1);
  table.decimal('unit_price', 10, 2).notNullable(); // Snapshot of price at checkout
});

  // 6. Services Table
  await knex.schema.createTable('services', (table) => {
    table.increments('service_id').primary();
    table.string('name', 100).notNullable();
    table.text('description');
    table.integer('duration_mins').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('capacity').notNullable().defaultTo(1);
  });

  // 7. Staff Availability
  await knex.schema.createTable('staff_availability', (table) => {
    table.increments('slot_id').primary();
    table.integer('staff_id').unsigned().references('user_id').inTable('users').onDelete('CASCADE');
    table.integer('service_id').unsigned().references('service_id').inTable('services').onDelete('CASCADE');
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
  });

  // 8. Bookings Table
  await knex.schema.createTable('bookings', (table) => {
    table.increments('booking_id').primary();
    table.integer('user_id').unsigned().references('user_id').inTable('users');
    table.integer('slot_id').unsigned().references('slot_id').inTable('staff_availability');
    table.specificType('booking_state', 'booking_status').notNullable().defaultTo('pending');
    table.specificType('payment_state', 'payment_status').notNullable().defaultTo('Unpaid');
    table.timestamps(true, true);
    table.unique(['slot_id']);
  });

  // 9. Add custom Postgres constraints & triggers (Filtered unique index)
  await knex.raw(`
    CREATE UNIQUE INDEX idx_single_booking_per_slot 
    ON bookings (slot_id) 
    WHERE booking_state != 'cancelled';
  `);
};

//exports.down = async function(knex) {
export async function down(knex) {
  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('staff_availability');
  await knex.schema.dropTableIfExists('services');
  await knex.schema.dropTableIfExists('order_items'); // <<< ADD THIS LINE
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('users');

  // Drop custom types
  await knex.raw(`DROP TYPE IF EXISTS booking_status;`);
  await knex.raw(`DROP TYPE IF EXISTS payment_status;`);
  await knex.raw(`DROP TYPE IF EXISTS order_status;`);
  await knex.raw(`DROP TYPE IF EXISTS stock_status;`);
  await knex.raw(`DROP TYPE IF EXISTS user_role;`);
};