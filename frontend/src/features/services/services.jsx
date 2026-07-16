import React, { useState } from 'react';
import './services.css';

// Mock Data representing our rich DB entities
const SERVICES = [
  {
    id: 's1',
    name: '1-on-1 Personal Training',
    description: 'Custom tailored fitness session with an elite coach.',
    duration: '60 mins',
    price: 80.00,
    type: 'time-slot', // Requires Staff + Time-slot
    capacity: 1, 
  },
  {
    id: 's2',
    name: 'Spins & Cardio Group Class',
    description: 'High-intensity group cycling session.',
    duration: '45 mins',
    price: 25.00,
    type: 'capacity-based', // Multiple slots available up to max capacity
    capacity: 15,
  }
];

const STAFF_MEMBERS = [
  { id: 'st1', name: 'Coach Alex Johnson', specialty: 'Strength' },
  { id: 'st2', name: 'Sarah Miller', specialty: 'Cardio/Yoga' }
];

// Mock database representation of current bookings to prevent double-bookings
const INITIAL_BOOKINGS = [
  {
    id: 'b1',
    serviceId: 's1',
    serviceName: '1-on-1 Personal Training',
    staffId: 'st1',
    staffName: 'Coach Alex Johnson',
    date: '2026-07-20',
    time: '10:00 AM',
    customerName: 'Alice Cooper',
    customerId: 'cust_alice',
    placesBooked: 1,
    status: 'Confirmed', // Pending, Confirmed, Completed, Cancelled
    paymentState: 'Paid' // Paid, Unpaid
  },
  {
    id: 'b2',
    serviceId: 's2',
    serviceName: 'Spins & Cardio Group Class',
    staffId: null,
    staffName: 'Event Room A',
    date: '2026-07-20',
    time: '02:00 PM',
    customerName: 'Bob Dylan',
    customerId: 'cust_bob',
    placesBooked: 2, // 2 slots taken out of 15 max capacity
    status: 'Pending',
    paymentState: 'Unpaid'
  }
];

export default function ServicesBookingSection() {
  const [currentUser, setCurrentUser] = useState({ id: 'cust_alice', role: 'customer', name: 'Alice Cooper' }); // Toggle roles: 'customer', 'staff_st1', 'admin'
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [selectedService, setSelectedService] = useState(null);
  
  // Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [requestedPlaces, setRequestedPlaces] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Role Switching Demo
  const handleRoleChange = (e) => {
    const val = e.target.value;
    if (val === 'admin') {
      setCurrentUser({ id: 'admin_user', role: 'admin', name: 'Administrator' });
    } else if (val === 'staff') {
      setCurrentUser({ id: 'st1', role: 'staff', name: 'Coach Alex Johnson' });
    } else {
      setCurrentUser({ id: 'cust_alice', role: 'customer', name: 'Alice Cooper' });
    }
  };

  // Business Logic: Check Double Booking & Capacity constraints
  const handleCreateBooking = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedService || !bookingDate || !bookingTime) {
      setErrorMessage("Please fill out all booking details.");
      return;
    }

    if (selectedService.type === 'time-slot') {
      if (!selectedStaffId) {
        setErrorMessage("Please select a staff member.");
        return;
      }
      // Rule 1: Prevent Double Booking for the same staff member at the same date and time
      const isDoubleBooked = bookings.some(b => 
        b.staffId === selectedStaffId && 
        b.date === bookingDate && 
        b.time === bookingTime &&
        b.status !== 'Cancelled'
      );

      if (isDoubleBooked) {
        setErrorMessage("This staff member is already booked at this time. Please select another slot.");
        return;
      }
    }

    if (selectedService.type === 'capacity-based') {
      // Rule 2: Check max capacity limit
      const existingBookedPlaces = bookings
        .filter(b => b.serviceId === selectedService.id && b.date === bookingDate && b.time === bookingTime && b.status !== 'Cancelled')
        .reduce((sum, b) => sum + b.placesBooked, 0);

      if (existingBookedPlaces + Number(requestedPlaces) > selectedService.capacity) {
        const spotsLeft = selectedService.capacity - existingBookedPlaces;
        setErrorMessage(`Over-capacity! Only ${spotsLeft} spot(s) remaining for this session.`);
        return;
      }
    }

    // Create New Booking Object
    const newBooking = {
      id: `b_${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      staffId: selectedService.type === 'time-slot' ? selectedStaffId : null,
      staffName: selectedService.type === 'time-slot' ? STAFF_MEMBERS.find(s => s.id === selectedStaffId)?.name : 'Group Session',
      date: bookingDate,
      time: bookingTime,
      customerName: currentUser.name,
      customerId: currentUser.id,
      placesBooked: selectedService.type === 'capacity-based' ? Number(requestedPlaces) : 1,
      status: 'Pending', // Defaults to Pending
      paymentState: 'Unpaid' // Separately tracked payment
    };

    setBookings([newBooking, ...bookings]);
    setSuccessMessage("Booking request submitted successfully (Pending approval)!");
    // Reset Form
    setSelectedService(null);
    setBookingDate('');
    setBookingTime('');
    setSelectedStaffId('');
    setRequestedPlaces(1);
  };

  // State Updates: Admin & Staff Allowed Status changes
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const updatePaymentState = (bookingId, newPaymentState) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentState: newPaymentState } : b));
  };

  return (
    <div className="booking-system-wrapper">
      
      {/* Dynamic Role Switcher for previewing logic */}


      <header className="booking-header">
        <h2>Our Services & Bookings Portal</h2>
        <p>Book private sessions or secure seats in high-capacity group classes seamlessly.</p>
      </header>

      <div className="booking-grid">
        


        {/* ================= RIGHT SIDE: CUSTOMER / ADMIN / STAFF VIEWS ================= */}
        <section className="bookings-management-column">
          
          {/* CUSTOMER PERSPECTIVE */}
          {currentUser.role === 'customer' && (
            <div className="dashboard-box customer-box">
              <h3>My Bookings</h3>
              <div className="booking-cards-container">
                {bookings.filter(b => b.customerId === currentUser.id).map(booking => (
                  <div key={booking.id} className="user-booking-card">
                    <div className="ubc-header">
                      <h5>{booking.serviceName}</h5>
                      <span className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                    <p>📅 {booking.date} at {booking.time}</p>
                    <p>👤 Professional: {booking.staffName}</p>
                    {booking.placesBooked > 1 && <p>🎟️ Spots Reserved: {booking.placesBooked}</p>}
                    
                    <div className="payment-tracking-row">
                      <span>Payment Status: <strong className={booking.paymentState.toLowerCase()}>{booking.paymentState}</strong></span>
                    </div>

                    {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                        className="btn-cancel-booking"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}




        </section>
      </div>
    </div>
  );
}