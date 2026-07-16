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
    user_id: ID!
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
    createdAt: String 
    updatedAt: String 
  }

  type CartItem {
    user_id: ID!
    product_id: ID!
    product: Product!
    quantity: Int!
  }

  type OrderItem {
    orderItemId: ID!
    orderId:ID!
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
    createdAt:String 
    updatedAt: String 
  }

  type StaffAvailability {
    slot_id: ID
    staff: User
    service: Service
    startTime: String
    endTime: String
  }


  type staff_table_attributes{
    slot_id: ID!
    staff: User!
    service: Service!
    start_time: String!
    end_time: String!
  }

    type Booking_By_ID {
    bookingId: ID!
    user: User!
    slot: staff_table_attributes!
    bookingState: BookingStatus!
    paymentState: PaymentStatus!
    createdAt: String!
  }

  type Booking {
    booking_id: ID!
    user: User!
    slot: StaffAvailability 
    bookingState: BookingStatus!
    paymentState: PaymentStatus!
    createdAt: String!
  }
    

  type AuthPayload {
    token: String!
    user: User!
  }


  input ProductInput {
  name: String!
  description: String
  price: Float!
  stockState: StockStatus!
  imageUrl: String
}

input ServiceInput {
  name: String!
  description: String
  price: Float!
  duration: String!
  imageUrl: String
}
`;

export default typeDefs;