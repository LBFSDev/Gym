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

  type BookingsAdmin {
  bookingId: Int!
  userEmail: String!
  service: String!
  trainer: String!
  startTime: String!
  endTime: String!
  bookingState: String!
  paymentState: String!
}
    

type BookingUpdate{

        bookingId:ID!
        userId:ID!
        slotId:ID!
        bookingState:BookingStatus!
        paymentState:PaymentStatus!
        createdAt:String!

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
  durationMins: Int!
  price: Float!
  capacity: Int!
}



type service_staff {
  service_id: Int
  service_name: String
}



type Staff {
  user_id: Int!
  email: String!
  role: String!
  created_at: String!
  services: [service_staff]
}


input AssignStaffServiceInput {
  staffId: Int!
  serviceId: Int!
  startTime: String!
  endTime: String!
}


  

input UpdateStaffServiceInput {
  slotId: Int!
  staffId: Int!
  serviceId: Int!
  startTime: String!
  endTime: String!
}

type Created_Staff {
  staffId: Int!
  email: String!
  serviceName: String!
  startTime: String!
  endTime: String!
}

type Update_Staff {
  staffId: ID!
  email: String!
  serviceId: ID!
  serviceName: String!
  startTime: String!
  endTime: String!
}

type New_Staff {
  staffId: Int!
  email: String!
  serviceId: String!
  startTime: String!
  endTime: String!
}


type StaffSchedule {
  slotId: Int!
  staffId: Int!
  staff: String!
  serviceId: Int!
  serviceName: String!
  startTime: String!
  endTime: String!
}


input UpdateBookingInput {
  bookingState: BookingStatus
  paymentState: PaymentStatus
}


`;

export default typeDefs;