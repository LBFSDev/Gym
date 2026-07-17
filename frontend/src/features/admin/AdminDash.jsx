import React, { useState, useEffect } from 'react';
import './admin.css'

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link, useNavigate  } from 'react-router-dom';
import {useAuth} from '../auth/AuthContext'



 const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      productId
      name
      description
      price
      stockState
      imageUrl
    }
  }
`;

const SERVICES = gql`
query SERVICES{
services{
    serviceId
    name
    description
    durationMins
    price
    capacity
    createdAt
    updatedAt
    
}

}
`


 const GET_STAFFS = gql`
  query GET_STAFFS {
     getAllStaff {
  user_id
  email
  role
  created_at
  services{
  service_id
  service_name
  }
    }
  }
`;



 const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      productId
      name
      price
      stockState
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      productId
      name
      price
      stockState
    }
  }
`;

//create new member
const CREATE_MEMBER = gql`
  mutation CREATE_MEMBER($input: AssignStaffServiceInput!) {
    assignStaffService(input: $input) {
  staffId
  email
  serviceName
  startTime
  endTime
    }
  }
`;

//Update member
const UPDATE_MEMBER = gql`
  mutation UPDATE_MEMBER($input: UpdateStaffServiceInput!) {
    updateStaffAvailability(input: $input) {

  staffId
  email
  serviceId
  serviceName
  startTime
  endTime
    }
  }
`;


 const REMOVE_MEMBER = gql`
  mutation REMOVE_MEMBER($staffId:ID!) {
    removeStaff(staffId:$staffId) 
  }
`;

const NEW_SLOT = gql`
  mutation NEW_SLOT($input: AssignStaffServiceInput!) {
    addStaffAvailability(input: $input) {
    staffId
    email
    serviceId
    startTime
    endTime
    }
  }
`;

const REMOVE_SLOT_BY_ID = gql`
  mutation REMOVE_SLOT_BY_ID($slotId: Int!) {
    deleteStaffAvailability(slotId: $slotId)
  }
`;


const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;


 const GET_SCHEDULE = gql`
  query GET_SCHEDULE {
     getStaffSchedule {
  slotId
  staffId
  staff
  serviceId
  serviceName
  startTime
  endTime
  }
    }
  
`;


 const CREATE_SERVICE = gql`
  mutation CREATE_SERVICE($input: ServiceInput!) {
    addService(input: $input) {
    serviceId
    name
    description
    durationMins
    price
    capacity
    createdAt
    updatedAt
    }
  }
`;


const UPDATE_SERVICE = gql`
   mutation UPDATE_SERVICE($service_id: Int!, $input: ServiceInput!){
    updateService(service_id: $service_id, input:$input){
    serviceId
    name
    description
    durationMins
    price
    capacity
    createdAt
    updatedAt
            
}
 }


`


 const REMOVE_SERVICE = gql`
  mutation REMOVE_SERVICE($service_id: Int!) {
     deleteService(service_id: $service_id)
  }
`;


 const GET_BOOKINGS= gql`
  query GET_BOOKINGS {
  getBookings {
  bookingId
  userEmail
  service
  trainer
  startTime
  endTime
  bookingState
  paymentState
  }
    }
  
`;


const UPDATE_BOOKING = gql`
   mutation UPDATE_BOOKING($bookingId: Int!,$input: UpdateBookingInput!){
    updateBooking(bookingId:$bookingId,input:$input){

        bookingId
        userId
        slotId
        bookingState
        paymentState
        createdAt
            
}
 }


`


const initialFormState = { id: null, name: '', description: '', price: '', stock: 'IN_STOCK', imageUrl: '' };
const initialFormMember = { staff_id: '', service_id:'', start_time:'', end_time: '' };
const initialFormUpdate = { slot_id: '', service_id:'', start_time:'', end_time: '' };
const initialFormService = { name: '', description:'', duration_mins:'', price: '' ,capacity:''};
const initialFormUpdateService = { name: '', description:'', duration_mins:'', price: '' ,capacity:''};
const initialFormBooking = {booking_state:'' , payment_state:''};
export default function FitZoneDashboard() {
  const navigate = useNavigate();
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('products');
  const [isDarkMode, setIsDarkMode] = useState(false);

  


    const {user , loading:authLoading} = useAuth();
      if (authLoading) {
      return <div className="p-8">Checking permissions...</div>;
    }
  
    if (!user || user.role !== "admin" && user.role!== "staff") {
      return <div className="p-8 text-red-500">Access denied.</div>;
    }

      const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);

      const { 
          data: StaffsData, 
          loading: StaffsLoading, 
          error: StaffsError,
          refetch: refetchStaffs
      } = useQuery(GET_STAFFS);

      //Services
      const { 
          data: servicesData, 
          loading: servicesLoading, 
          error: servicesError,
          refetch: refetchServices
      } = useQuery(SERVICES);

      //SCHEDULE
            const { 
          data: scheduleData, 
          loading: scheduleLoading, 
          error: scheduleError,
          refetch: refetchSchedule
      } = useQuery(GET_SCHEDULE);
      
      //BOOKINGS
                  const { 
          data: bookingsData, 
          loading: bookingsLoading, 
          error: bookingsError,
          refetch: refetchBookings
      } = useQuery(GET_BOOKINGS);

      const [createProduct] = useMutation(CREATE_PRODUCT);
      const [updateProduct] = useMutation(UPDATE_PRODUCT);
      const [deleteProduct] = useMutation(DELETE_PRODUCT);
      const [createMember] = useMutation(CREATE_MEMBER);
      const [removeMember] = useMutation(REMOVE_MEMBER);
      const [updateMember] = useMutation(UPDATE_MEMBER);
      const [newSlot] = useMutation(NEW_SLOT);
      const [removeSlot] = useMutation(REMOVE_SLOT_BY_ID);
      const [createService] = useMutation(CREATE_SERVICE);
      const [removeService] = useMutation(REMOVE_SERVICE);
      const [updateService] = useMutation(UPDATE_SERVICE);
      const [updateBooking] = useMutation(UPDATE_BOOKING);

        const [formState, setFormState] = useState(initialFormState);
        const [formError, setFormError] = useState('');
        const [isModalOpen, setIsModalOpen] = useState(false);

        //Add new staff member
        const [CreateM, setCreateM] = useState(false);
        const [formMember, setFormMember] = useState(initialFormMember);

        //Update member
        const [UpdateM, setUpdate] = useState(false);
        const [StaffID, setStafID] = useState('');
        const [formUpdate, setFormUpdate] = useState(initialFormUpdate);

        //New Service
        const [CreateS, setCreateS] = useState(false);
        const [UpdateS, setUpdateS] = useState(false);
        const [formService, setFormService] = useState(initialFormService);
        const [ServiceID,setServiceID] = useState('');
        const [formUpdateS,setformUpdateS] = useState(initialFormUpdateService);

        //Booking Management
        const [ManageB,setManageB] = useState(false);
        const [BookingID,setBookingID] = useState('');
        const [formBooking,setformBooking] = useState(initialFormBooking);
        
        
        

        
      
        if (loading) return <div className="p-8">Loading catalog management...</div>;
        if (error) return <div className="p-8 text-red-500">Error rendering control panel.</div>;
      
        const handleEditClick = (product) => {
          setFormState({
            id: product.productId,
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stockState.toString(),
            imageUrl: product.imageUrl || ''
          });
          setFormError('');
          setIsModalOpen(true);
        };
      
        const handleDelete = async (id) => {
          if (window.confirm('Are you sure you want to delete this product?')) {
            try {
              await deleteProduct({ variables: { id } });
              refetch();
            } catch (err) {
              alert(err.message);
            }
          }
        };
      
        const handleSubmit = async (e) => {
          e.preventDefault();
          setFormError('');
      
          // --- Strict Validation ---
          const priceVal = parseFloat(formState.price);
          const stockVal = formState.stock;
      
          if (!formState.name.trim()) {
            setFormError('Product name is required.');
            return;
          }
          if (isNaN(priceVal) || priceVal < 0) {
            setFormError('Price must be a valid, positive number.');
            return;
          }
          // if (isNaN(stockVal) || stockVal < 0 || !Number.isInteger(Number(formState.stock))) {
          //   setFormError('Stock must be an integer and cannot be negative.');
          //   return;
          // }
      
          const variables = {
            input: {
              name: formState.name,
              description: formState.description,
              price: priceVal,
              stockState: stockVal,
              imageUrl: formState.imageUrl
            }
          };
      
          try {
            if (formState.id) {
              await updateProduct({ variables: { id: formState.id, ...variables } });
            } else {
              await createProduct({variables});
            }
            setIsModalOpen(false);
            setFormState(initialFormState);
            refetch();
          } catch (err) {
            setFormError(err.message);
          }
        };



        const handleAddMember = async (e) => {
          e.preventDefault();
          setFormError('');
        if (!formMember.start_time || !formMember.end_time) {
    setFormError("Start time and end time are required");
    return;
  }
      
          const variables = {
            input: {
            staffId: Number(formMember.staff_id),
            serviceId: Number(formMember.service_id),
            startTime: new Date(formMember.start_time).toISOString(),
            endTime: new Date(formMember.end_time).toISOString()
         }};
      
          try {
                await createMember({variables});
                setCreateM(false);
                setFormMember(initialFormMember);
                refetchStaffs();
          } catch (err) {
            setFormError(err.message);
          }
        };


        
        
       const handleUpdateMember = async (e) => {
          e.preventDefault();
          setFormError('');
        if (!formUpdate.start_time || !formUpdate.end_time) {
    setFormError("Start time and end time are required");
    return;
  }
      
          const variables = {
            input: {
            slotId:Number(formUpdate.slot_id),
            staffId: Number(StaffID),
            serviceId: Number(formUpdate.service_id),
            startTime: new Date(formUpdate.start_time).toISOString(),
            endTime: new Date(formUpdate.end_time).toISOString()
         }};
      
          try {
                await updateMember({variables});
                setUpdate(false);
                setFormUpdate(initialFormUpdate);
                setStafID('');
                refetchStaffs();
                refetchSchedule();
          } catch (err) {
            setFormError(err.message);
          }
        };

        


        const handleAddSlot  = async (e) => {
        e.preventDefault();
          setFormError('');
         if (!formUpdate.start_time || !formUpdate.end_time) {
         setFormError("Start time and end time are required");
             return;
            }
      
          const variables = {
            input: {
            staffId: Number(StaffID),
            serviceId: Number(formUpdate.service_id),
            startTime: new Date(formUpdate.start_time).toISOString(),
            endTime: new Date(formUpdate.end_time).toISOString()
         }};
      
          try {
                await newSlot({variables});
                setUpdate(false);
                setFormUpdate(initialFormUpdate);
                setStafID('');
                refetchStaffs();
                refetchSchedule();
          } catch (err) {
            setFormError(err.message);
          }
        };


    const handleRemoveSlot = async () => {
          if (window.confirm('Are you sure you want to delete this slot?')) {
            try {
              await removeSlot({ variables: {slotId:Number(formUpdate.slot_id) } });
              refetchStaffs();
              refetchSchedule();
            } catch (err) {
              alert(err.message);
            }
          }
        };
    
   

        const handleAddService  = async (e) => {
        e.preventDefault();
          setFormError('');
         if (!formService.duration_mins) {
         setFormError("duration is required");
             return;
            }
      
          const variables = {
            input: {
            name:formService.name,
            description:formService.description,
            durationMins:Number(formService.duration_mins),
            price:Number(formService.price),
            capacity:Number(formService.capacity)
         }};
      
          try {
                await createService({variables});
                setCreateS(false);
                setFormService(initialFormService);
                refetchServices();
          } catch (err) {
            setFormError(err.message);
          }
        };
        


     const handleUpdateService = async (e) => {
     e.preventDefault();
     setFormError('');
     if (!formUpdateS.duration_mins) {
    setFormError("duration is required");
    return;
  }

          const variables = {
            service_id:Number(ServiceID)
            ,
            input: {
            name:formUpdateS.name,
            description:formUpdateS.description,
            durationMins:Number(formUpdateS.duration_mins),
            price: Number(formUpdateS.price),
            capacity: Number(formUpdateS.capacity),
         }};
      
          try {
                await updateService({variables});
                setUpdateS(false);
                setformUpdateS(initialFormUpdateService);
                setServiceID('');
                refetchServices();
          } catch (err) {
            setFormError(err.message);
          }
        };

        

    const handleUpdateBook = async (e) => {
     e.preventDefault();
     setFormError('');

          const variables = {
            bookingId:Number(BookingID)
            ,
            input: {
            bookingState:formBooking.booking_state,
            paymentState:formBooking.payment_state,

         }};
      
          try {
                await updateBooking({variables});
                setManageB(false);
                setformBooking(initialFormBooking);
                setBookingID('');
                refetchBookings();
          } catch (err) {
            setFormError(err.message);
          }
        };
      
      const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
      
        const formData = new FormData();
        formData.append("image", file);
      
        try {
          const response = await fetch("http://localhost:4000/upload/product-image", {
            method: "POST",
            body: formData,
          });
      
          console.log("Status:", response.status);
      
          const data = await response.json();
          console.log(data);
      
          if (!response.ok) {
            throw new Error(data.message || "Upload failed");
          }
      
          setFormState((prev) => ({
            ...prev,
            imageUrl: data.url,
          }));
        } catch (err) {
          console.error(err);
          alert(err.message);
        }
      };

  // --- THEME TOGGLER ---
//   useEffect(() => {
//     if (isDarkMode) {
//       document.body.classNameList.add('dark-theme');
//     } else {
//       document.body.classNameList.remove('dark-theme');
//     }
//   }, [isDarkMode]);



  // Helper helper to dynamically map tab machine keys to readable names
  const getTabLabel = () => {
    switch(activeTab) {
      case 'products': return 'Products';
      case 'staff': return 'Staff Directory';
      case 'schedule': return 'Shift Planner';
      default: return 'Dashboard';
    }
  };
  
 

  const handlelogout = () => {
    try{
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/login");
    }catch(err){
        console.log(err);
    }
};


  return (
    <div className={`dashboard-wrapper ${isDarkMode ? "dark-modea" : ""}`}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-identity">
          <div className="brand-logo">Ω</div>
          <span className="brand-name">FitZone</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <span>Products</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span>Staff Directory</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z"/>
            </svg>
            <span>Shift Planner</span>
          </button>


        <button 
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
        <svg
            className="nav-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
        >
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9 6V5a2 2 0 012-2h2a2 2 0 012 2v1m5 3H4m16 0v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9m16 0V8a2 2 0 00-2-2H6a2 2 0 00-2 2v1"
  />
</svg>
            <span>Services</span>
          </button>



        <button 
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
<svg
  className="nav-icon"
  fill="none"
  stroke="currentColor"
  strokeWidth="2.2"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M8 7V3m8 4V3m-9 8l2 2 4-4m5 8H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z"
  />
</svg>
            <span>Bookings</span>
          </button>
        </nav>

        <div className="sidebar-user">
          <img 
            className="user-avatar" 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
            alt="Profile" 
          />
          <div className="user-info">
            <p className="user-name">Clara Sinclair</p>
            <span className="user-role">Head Admin</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN AREA */}
      <div className="main-container">
        
        {/* Top Navigation Bar */}
        <header className="top-nav">
          <div className="top-nav-left">
            <button className="menu-toggle" id="menuToggle">
              <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="breadcrumb-label">
              Admin / <span className="active-tab-text">{getTabLabel()}</span>
            </span>
          </div>

          <div className="top-nav-right">
            <button 
              className="icon-btn theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                // Sun Icon for returning to Light Mode
                <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              ) : (
                // Moon Icon for Dark Mode
                <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </button>
            <div className="divider"></div>
            <button className="logout-btn" onClick={handlelogout}>Logout</button>
          </div>
        </header>

        {/* Dynamic Workspace Pages */}
        <main className="content-viewport">

          {/* TAB PAGE B: PRODUCTS */}
          {activeTab === 'products' && (
            <section className="tab-pane active">
              <div className="section-header">
                <div className="page-heading">
                  <h1>Product Catalog</h1>
                  <p>Edit pricing tables, categories, and stock limits.</p>
                </div>
                <button className="primary-btn" onClick={() => setIsModalOpen(true)}>Create Product</button>
              </div>

              <div className="table-container">
                      <table className="data-table">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm uppercase">
              <th className="p-4">Product ID</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {data?.products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200">
               <td className='mono-text'>{String(product.productId).toString()}</td>
                <td className="table-item-cell">{product.name}</td>
                <td className="p-4 text-sm max-w-xs truncate">{product.description}</td>
                <td className="bold-text">${product.price.toFixed(2)}</td>
                <td className='className="badge badge-success'>
                  {product.stockState} 
                </td>
                <td className="p-4 flex justify-center space-x-2">
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <span className="text-gray-350">|</span>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="text-red-600 hover:text-red-900 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
              </div>
            </section>
          )}

          {/* TAB PAGE C: STAFF */}
          {activeTab === 'staff' && (
            <section className="tab-pane active">
              <div className="section-header">
                <div className="page-heading">
                  <h1>Staff Management</h1>
                  <p>Control operational roles, permissions, and directory files.</p>
                </div>
                <button className="primary-btn" onClick={()=>setCreateM(true)}>Add Team Member</button>
              </div>

              <div className="cards-grid">
                {StaffsData?.getAllStaff?.map((member) => (
                  <div key={member.user_id} className="staff-card">
                    <div className="staff-card-header">
                      {/* <img src={member.avatar} alt={member.name} className="staff-avatar" /> */}
                      {/* <span className="badge badge-success">{member.status}</span> */}
                    </div>
                    <h3 className="staff-name">{member.email}</h3>
                    {member.services.map((service) => (
                   <div key={service.service_id}> <p className="staff-title">{service.service_name}</p></div>
                    ))}
                    {/* <div className="staff-contact"> */}
                      {/* <div className="contact-row">
                        <svg className="small-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <span>{member.email}</span>
                      </div> */}
                      {/* <div className="contact-row">
                        <svg className="small-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        <span>{member.phone}</span>
                      </div> */}
                    {/* </div> */}

                    <div className="card-actions">
                      
                      
                      <button className="danger-btn-text" onClick={async ()=>{   
                         if (!window.confirm(`Remove ${member.email} from staff?`)) return;

                         try {
                             await removeMember({
                                   variables: {
                                   staffId: member.user_id,
                                },
                                   });

                                    await refetchStaffs(); // refresh staff list
                             } catch (err) {
                              alert(err.message);
    }}}>Remove Team Member</button>
    <button className="danger-btn-text" onClick={()=>{setUpdate(true);setStafID(member.user_id)}}>Update</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB PAGE D: SCHEDULE */}
          {activeTab === 'schedule' && (
            <section className="tab-pane active">
              <div className="section-header">
                <div className="page-heading">
                  <h1>Staff Shedule</h1>
                  <p>Assign weekly shifts for active rosters.</p>
                </div>
                <div className="action-buttons-group">
                  {/* <button className="secondary-btn">Copy Previous Week</button>
                  <button className="primary-btn">Assign Shift</button> */}
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>slot_id</th>
                      <th>staff_id</th>
                      <th>staff_email</th>
                      <th>service</th>
                      <th>start</th>
                      <th>end</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData?.getStaffSchedule?.map((row) => (
                      <tr key={row.slotId}>
                     
                        <td>{row.slotId}</td>
                           <td>{row.staffId}</td>
                        <td>
                          <span className="bold-text block">{row.staff}</span>
                          
                        </td>
                        <td>{row.serviceName}</td>
                     <td>{new Date(Number(row.startTime)).toLocaleString()}</td>
                     <td>{new Date(Number(row.endTime)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}






            {/*Services */}
          {activeTab === 'services' && (
            <section className="tab-pane active">
              <div className="section-header">
                <div className="page-heading">
                  <h1>Services Management</h1>
                  <p>Control operational roles, permissions, and directory files.</p>
                </div>
                <button className="primary-btn" onClick={()=>setCreateS(true)}>Add New Service</button>
              </div>

              <div className="cards-grid">
                {servicesData.services.map((member) => (
                  <div key={member.serviceId} className="staff-card">
                    <div className="staff-card-header">
                      {/* <img src={member.avatar} alt={member.name} className="staff-avatar" /> */}
                      {/* <span className="badge badge-success">{member.status}</span> */}
                    </div>
                    <h3 className="staff-name">{member.name}</h3>
                   
                    <p className="staff-title">{member.description}</p>
                    <p className="staff-title">{member.capacity}</p>
                    <h2 className="staff-title">{member.price}$</h2>
                
                    {/* <div className="staff-contact"> */}
                      {/* <div className="contact-row">
                        <svg className="small-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <span>{member.email}</span>
                      </div> */}
                      {/* <div className="contact-row">
                        <svg className="small-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        <span>{member.phone}</span>
                      </div> */}
                    {/* </div> */}

                    <div className="card-actions">
                      
                      
                      <button className="danger-btn-text" onClick={async ()=>{   
                         if (!window.confirm(`Remove ${member.name} from services?`)) return;

                         try {
                             await removeService({
                                   variables: {
                                 service_id: Number(member.serviceId),
                                },
                                   });

                                    await refetchServices(); // refresh staff list
                             } catch (err) {
                              alert(err.message);
    }}}>Remove Service</button>
    <button className="danger-btn-text" onClick={()=>{setUpdateS(true);setServiceID(member.serviceId)}}>Update</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}














            {/* TAB PAGE D: Bookings */}
          {activeTab === 'bookings' && (
            <section className="tab-pane active">
              <div className="section-header">
                <div className="page-heading">
                  <h1></h1>
                  <p>Booking Management</p>
                </div>
                <div className="action-buttons-group">
                  {/* <button className="secondary-btn">Copy Previous Week</button>
                  <button className="primary-btn">Assign Shift</button> */}
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>booking_id</th>
                      <th>user_email</th>
                      <th>service</th>
                      <th>trainer</th>
                      <th>start_time</th>
                      <th>end_time</th>
                      <th>state</th>
                      <th>payment</th>
                      <th>action</th>
                      

                    </tr>
                  </thead>
                  <tbody>
                    {bookingsData?.getBookings?.map((row) => (
                      <tr key={row.bookingId}>
                     
                        <td>{row.bookingId}</td>
                           <td>{row.userEmail}</td>
                  
                        <td>{row.service}</td>
                       <td><span className="bold-text block">{row.trainer}</span> </td>
                     <td>{new Date(Number(row.startTime)).toLocaleString()}</td>
                     <td>{new Date(Number(row.endTime)).toLocaleString()}</td>
                     <td>{row.bookingState}</td>
                     <td>{row.paymentState}</td>
                       <td><button onClick={()=>{setBookingID(row.bookingId); setManageB(true)}}>manage</button></td>
                      </tr>
                    ))}
                  
                  </tbody>
                </table>
              </div>
            </section>
          )}



















        </main>
      </div>





























      {/* --- PRODUCT FORM MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay visible" id="productModal">
          <div className="modal-content">
            <h3 className="modal-title">Create Catalog Entry</h3>
            <p className="modal-subtitle">Configure retail stock levels and pricing tables.</p>
            
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
               <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <select
                   required
                   value={formState.stock}
                   onChange={(e) => setFormState({ ...formState, stock: e.target.value })}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  >
                    <option value='IN_STOCK'>In Stock</option>
                    <option value='LOW_STOCK'>Low Stock</option>
                    <option value='OUT_OF_STOCK'>Out of Stock</option>
                  </select>
                </div>

                <div className="form-group">
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  rows={3}
                />
                </div>


                <div  className="form-group">
                <input
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
                />
                </div>


              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {formState.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>

            {/* <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Count *</label>
                  
                  <select
                   required
                   value={formState.stock}
                   onChange={(e) => setFormState({ ...formState, stock: e.target.value })}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  >
  <option value='IN_STOCK'>In Stock</option>
  <option value='LOW_STOCK'>Low Stock</option>
  <option value='OUT_OF_STOCK'>Out of Stock</option>
</select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Image URL</label>
                <input
                  type="url"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />

                <input
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {formState.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form> */}
          </div>
        </div>
      )}






{/* Create New Team Member */}

      {CreateM && (
        <div className="modal-overlay visible" id="productModal">
          <div className="modal-content">
            <h3 className="modal-title">Create Member</h3>
            <p className="modal-subtitle">Add new member to team and assign him a service</p>
            
            <form className="modal-form" onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">User ID</label>
               <input
                  type="num"
                  required
                  value={formMember.staff_id}
                  onChange={(e) => setFormMember({ ...formMember, staff_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>
              <div className="form-grid">

                <div className="form-group">
                <label>Start Time</label>
                <input
                 type="datetime-local"
                 name="startTime"
                 value={formMember.start_time}
                 onChange={(e)=>{setFormMember({...formMember , start_time: e.target.value})}}
                />
                </div>

                <div className="form-group">
                <label>End Time</label>
                <input
                type="datetime-local"
                name="endTime"
                value={formMember.end_time}
                onChange={(e)=>{setFormMember({...formMember , end_time:e.target.value})}}
                />
                </div>

                <div className="form-group">
                <label className="form-label">Service</label>
               <select onChange={(e)=>{setFormMember({...formMember , service_id:e.target.value})}}>
                <option>choose a service</option>
                {servicesData?.services?.map(service => (
              <option key={service?.serviceId} value={service?.serviceId}>{service?.name}</option>

                ))}
             </select>
                </div>



              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setCreateM(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                 Add
                </button>
              </div>
            </form>

          </div>
        </div>
      )}



      {/* Update Team Member */}

      {UpdateM && (
        <div className="modal-overlay visible" id="productModal">
          <div className="modal-content">
            <h3 className="modal-title">Update Member</h3>
            <p className="modal-subtitle">Add new member to team and assign him a service</p>
            
            <form className="modal-form" onSubmit={handleUpdateMember}>
              <div className="form-group">
                <label className="form-label">Slot ID</label>
               <input
                  type="num"
                  
                  value={formUpdate.slot_id}
                  onChange={(e) => setFormUpdate({ ...formUpdate, slot_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>
              <div className="form-grid">

                <div className="form-group">
                <label>Start Time</label>
                <input
                 type="datetime-local"
                 name="startTime"
                 value={formUpdate.start_time}
                 onChange={(e)=>{setFormUpdate({...formUpdate , start_time: e.target.value})}}
                />
                </div>

                <div className="form-group">
                <label>End Time</label>
                <input
                type="datetime-local"
                name="endTime"
                value={formUpdate.end_time}
                onChange={(e)=>{setFormUpdate({...formUpdate , end_time:e.target.value})}}
                />
                </div>

                <div className="form-group">
                <label className="form-label">Service</label>
               <select onChange={(e)=>{setFormUpdate({...formUpdate , service_id:e.target.value})}}>
                <option>choose a service</option>
                {servicesData?.services?.map(service => (
              <option key={service?.serviceId} value={service?.serviceId}>{service?.name}</option>

                ))}
             </select>
                </div>



              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={()=>handleAddSlot()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              
              >
                 New Slot
                </button>
                 <button
                  type="button"
                  onClick={()=>handleRemoveSlot()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                 Remove
                </button>
                <button
                  type="button"
                  onClick={() => setUpdate(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                 Update
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Create New Service */}

      {CreateS && (
        <div className="modal-overlay visible" id="productModal">
          <div className="modal-content">
            <h3 className="modal-title">Create Service</h3>
            <p className="modal-subtitle">Add new member to team and assign him a service</p>
            
            <form className="modal-form" onSubmit={handleAddService}>

              <div className="form-grid">
                              <div className="form-group">
                <label className="form-label">Name</label>
               <input
                  type="text"
                  required
                  value={formService.name}
                  onChange={(e) => setFormService({ ...formService, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

            <div className="form-group">
                <label className="form-label">Description</label>
               <input
                  type="textarea"
                  required
                  value={formService.description}
                  onChange={(e) => setFormService({ ...formService, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>
            <div className="form-group">
                <label className="form-label">Duration</label>
               <input
                  type="number"
                  required
                  value={formService.duration_mins}
                  onChange={(e) => setFormService({ ...formService, duration_mins: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

             <div className="form-group">
                <label className="form-label">Capacity</label>
               <input
                  type="number"
                  required
                  value={formService.capacity}
                  onChange={(e) => setFormService({ ...formService, capacity: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

                <div className="form-group">
                <label>Price</label>
                <input
                 type="number"
                 name="startTime"
                 step="0.01"
                 value={formService.price}
                 onChange={(e)=>{setFormService({...formService , price: e.target.value})}}
                />
                </div>

              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setCreateS(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                 Add
                </button>
              </div>
            </form>

          </div>
        </div>
      )}






      {/* Update Team Member */}

      {UpdateS && (
        <div className="modal-overlay visible" id="productModal">
          <div className="modal-content">
            <h3 className="modal-title">Update Member</h3>
            <p className="modal-subtitle">Add new member to team and assign him a service</p>
            
            <form className="modal-form" onSubmit={handleUpdateService}>
                <div className="form-grid">
                              <div className="form-group">
                <label className="form-label">Name</label>
               <input
                  type="text"
                  required
                  value={formUpdateS.name}
                  onChange={(e) => setformUpdateS({ ...formUpdateS, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

            <div className="form-group">
                <label className="form-label">Description</label>
               <input
                  type="textarea"
                  required
                  value={formUpdateS.description}
                  onChange={(e) => setformUpdateS({ ...formUpdateS, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>
            <div className="form-group">
                <label className="form-label">Duration</label>
               <input
                  type="number"
                  required
                  value={formUpdateS.duration_mins}
                  onChange={(e) => setformUpdateS({ ...formUpdateS, duration_mins: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

             <div className="form-group">
                <label className="form-label">Capacity</label>
               <input
                  type="number"
                  required
                  value={formUpdateS.capacity}
                  onChange={(e) => setformUpdateS({ ...formUpdateS, capacity: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                />
              </div>

                <div className="form-group">
                <label>Price</label>
                <input
                 type="number"
                 name="startTime"
                 step="0.01"
                 value={formUpdateS.price}
                 onChange={(e)=>{setformUpdateS({...formUpdateS , price: e.target.value})}}
                />
                </div>

              </div>
              <div className="modal-actions">


                <button
                  type="button"
                  onClick={() => setUpdateS(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                 Update
                </button>
              </div>
            </form>

          </div>
        </div>
      )}



      
      {/*Manage Book State */}

      {ManageB && (
        <div className="modal-overlay visible" id="productModal">
          <div className="modal-content">
            <h3 className="modal-title">Manage Book #{BookingID}</h3>
            <p className="modal-subtitle">Add new member to team and assign him a service</p>
            
            <form className="modal-form" onSubmit={handleUpdateBook}>
                <div className="form-grid">
                              <div className="form-group">
                <label className="form-label">Booking State</label>
               <select
                  required
                  value={formBooking.booking_state}
                  onChange={(e) => setformBooking({ ...formBooking, booking_state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                > 
                    <option value={''}>choose</option>
                    <option value={'pending'}>pending</option>
                    <option value={'confirmed'}>confirmed</option>
                    <option value={'completed'}>completed</option>
                    <option value={'cancelled'}>cancelled</option>
                </select>
              </div>

            <div className="form-group">
                <label className="form-label">Payment State</label>
               <select
                  required
                  value={formBooking.payment_state}
                  onChange={(e) => setformBooking({ ...formBooking, payment_state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                >
                    <option value={''}>choose</option>
                    <option value={'Paid'}>Paid</option>
                    <option value={'Unpaid'}>Unpaid</option>
                </select>
              </div>
   


       

              </div>
              <div className="modal-actions">


                <button
                  type="button"
                  onClick={() => setManageB(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                 Update
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


















    </div>
  );
}