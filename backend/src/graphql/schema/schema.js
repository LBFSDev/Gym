import { gql } from "graphql-tag";
import typeDefs from "../types/typeDefs.js"

export const queryAndmutation = gql`
    
  # Entry Points for reading data
  type Query {
    # Products & Cart
    products: [Product!]!
    product(id: ID!): Product
    viewCart: [CartItem!]!
    
    # Orders
    myOrders: [Order!]! # For customers
    allOrders: [Order!]! # For admins
    
    # Services & Bookings
    services: [Service!]!
    service(id: ID!): Service
    availableStaffs(serviceId: ID!): [StaffAvailability!]!
    myBookings: [Booking_By_ID!]! # Customers manage/view their own
    allBookings: [Booking!]! # Admins manage all
    getBookings: [BookingsAdmin!]!
   

    me: User

    #staffs
    getAllStaff: [Staff!]!
    getStaffSchedule: [StaffSchedule!]!


  
  }

  # Entry Points for mutating/changing data
  type Mutation {
    # Shopping Cart & Checkout
    addToCart(productId: ID!): CartItem!
    removeFromCart(productId:ID!):CartItem!
    checkout:Order!
    cancelOrder(orderId: ID!): Order!
    
    # Order Admin Management
    updateOrderStatus(orderId: ID!, state: OrderStatus!): Order!
    updateOrderPaymentStatus(orderId: ID!, state: PaymentStatus!): Order!

    # Admin Product Mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!


    # Admin Service Mutations
    addService(input: ServiceInput!): Service!
    updateService(service_id: Int!, input: ServiceInput!): Service!
    deleteService(service_id: Int!): Boolean!
    assignStaffService(input: AssignStaffServiceInput!): Created_Staff
    removeStaff(staffId:ID!):Boolean!
    updateStaffAvailability(input: UpdateStaffServiceInput!):Update_Staff
    addStaffAvailability(input: AssignStaffServiceInput!): New_Staff 
    deleteStaffAvailability(slotId: Int!): Boolean!


    # Bookings & Reservations
    createBooking(slotId: ID!): Booking!
    updateBookingStatus(bookingId: ID!, state: BookingStatus!): Booking! # Admins/Staff
    deleteBooking(booking_id: ID!): Boolean!
    updateBookingPaymentStatus(bookingId: ID!, state: PaymentStatus!): Booking! # Admins
    updateBooking(bookingId: Int!,input: UpdateBookingInput!): BookingUpdate
   
  
    #Authentication & Role-Based Authorization
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    }
    `

export default [
  typeDefs,
  queryAndmutation
];