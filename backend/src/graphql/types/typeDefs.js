// src/graphql/typeDefs.js
import { gql } from 'graphql-tag';

const typeDefs = gql`
  # Custom Enums matching our DB states
  enum UserRole {
    customer
    staff
    admin
  }

  enum StockStatus {
    IN_STOCK
    OUT_OF_STOCK
    LOW_STOCK
  }

  enum OrderStatus {
    pending
    confirmed
    completed
    cancelled
  }

  enum PaymentStatus {
    Unpaid
    Paid
  }

  enum BookingStatus {
    pending
    confirmed
    completed
    cancelled
  }

  # Core Types
  type User {
    userId: ID!
    email: String!
    role: UserRole!
  }

  type Product {
    productId: ID!
    name: String!
    description: String
    price: Float!
    stockState: StockStatus!
    imageUrl: String
  }

  type CartItem {
    user_id: ID!
    product_id: ID!
    product: Product!
    quantity: Int!
  }

  type OrderItem {
    orderItemId: ID!
    product: Product
    quantity: Int!
    unitPrice: Float!
  }

  type Order {
    orderId: ID!
    totalAmount: Float!
    orderState: OrderStatus!
    paymentState: PaymentStatus!
    createdAt: String!
    items: [OrderItem!]!
  }

  type Service {
    serviceId: ID!
    name: String!
    description: String
    durationMins: Int!
    price: Float!
    capacity: Int!
  }

  type StaffAvailability {
    slotId: ID!
    staff: User!
    service: Service!
    startTime: String!
    endTime: String!
  }

  type Booking {
    bookingId: ID!
    user: User!
    slot: StaffAvailability!
    bookingState: BookingStatus!
    paymentState: PaymentStatus!
    createdAt: String!
  }

`;

export default typeDefs;