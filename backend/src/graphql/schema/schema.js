import { gql } from "graphql-tag";
import typeDefs from "../types/typeDefs.js"

export const queryAndmutation = gql`
    
  # Entry Points for reading data
  type Query {
    # Products & Cart
    products: [Product!]!
    viewCart: [CartItem!]!
    
    # Orders
    myOrders: [Order!]! # For customers
    allOrders: [Order!]! # For admins
    
    # Services & Bookings
    services: [Service!]!
    availableSlots(serviceId: ID!): [StaffAvailability!]!
    myBookings: [Booking!]! # Customers manage/view their own
    allBookings: [Booking!]! # Admins manage all
    me: User
  
  }

  # Entry Points for mutating/changing data
  type Mutation {
    # Shopping Cart & Checkout
    addToCart(productId: ID!, quantity: Int!): CartItem!
    checkoutCart: Order!
    
    # Order Admin Management
    updateOrderStatus(orderId: ID!, state: OrderStatus!): Order!
    updateOrderPaymentStatus(orderId: ID!, state: PaymentStatus!): Order!

    # Bookings & Reservations
    createBooking(slotId: ID!): Booking!
    updateBookingStatus(bookingId: ID!, state: BookingStatus!): Booking! # Admins/Staff
    updateBookingPaymentStatus(bookingId: ID!, state: PaymentStatus!): Booking! # Admins
  
    #Authentication & Role-Based Authorization
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    }
    `

export default [
  typeDefs,
  queryAndmutation
];