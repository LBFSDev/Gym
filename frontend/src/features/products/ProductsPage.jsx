import React, { useEffect, useState } from 'react';

import { gql } from "@apollo/client";


import { Link, useNavigate  } from 'react-router-dom';

import './style.css'
import { useQuery, useMutation } from "@apollo/client/react";





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


const AddToCart = gql`
  mutation AddToCart($productId: ID!) {
    addToCart(productId: $productId) {
      product_id
      quantity
    }
  }
`;


const RemoveFromCart = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      product_id
      quantity
    }
  }
`;


const Checkout = gql`
  mutation Checkout{
    checkout{
    orderId
    totalAmount
    orderState
    paymentState
    createdAt
    items{
    orderItemId
    quantity
    unitPrice
    product{
      productId
      name
      description
      price
      stockState
      imageUrl
    }

    }
    }
  }

`;


const ViewCart = gql`
 

  query ViewCart {

    viewCart{

    user_id
    product_id
    quantity
    product{
    name 
    price 
    imageUrl
    }

    }

  }

`;



 const MyOrders = gql`

  query MyOrders {
    myOrders{
    orderId
    totalAmount
    orderState
    paymentState
    createdAt
    items{
    orderItemId
    orderId
    product{
    name 
    price 
    imageUrl
    }
    quantity
    unitPrice
    }

    }

  }

`;



const CancelOrder = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId : $orderId ) {
    orderId
    totalAmount
    orderState
    paymentState
    createdAt
    items{
    orderItemId
    orderId
    product{
    name 
    price 
    imageUrl
    }
    quantity
    unitPrice
    }
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

const AVAILABLE_STAFFS = gql`
query AVAILABLE_STAFFS($serviceId: ID!){

availableStaffs(serviceId:$serviceId){
    slot_id
    staff{
    user_id
    email
    role
    }
    service{
    serviceId
    name
    description
    durationMins
    price
    capacity
    }
    startTime
    endTime
}
}

`;


const Booking=  gql`
  mutation Booking($slotId: ID!) {
    createBooking(slotId: $slotId) {
    booking_id
    user{
    user_id
    email
    role
    }
    slot{
    slot_id
    staff{
    user_id
    email
    role
    }
    service{
    serviceId
    name
    description
    durationMins
    price
    capacity
    createdAt
    updatedAt
    }
    startTime
    endTime
    }
    bookingState
    paymentState
    createdAt
    }
  }
`;



const MY_BOOKINGS = gql`
query MY_BOOKINGS{

myBookings{
    bookingId
    user{
    user_id
    email
    role
    }
    slot{
    slot_id
    staff{
    user_id
    email
    role
    }
    service{
    serviceId
    name
    description
    durationMins
    price
    capacity
    createdAt 
    updatedAt
    }
    start_time
    end_time
    
    }
    bookingState
    paymentState
    createdAt
}
}

`;



const DeleteBooking = gql`
  mutation DeleteBooking($booking_id: ID!) {
    deleteBooking(booking_id: $booking_id)
  }
`;




export default function ProductsPage() {
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_PRODUCTS);

  const [Cartitems , setCartitems] = useState([]);

const [addToCart] = useMutation(AddToCart,{
    
    onCompleted:()=>{
        refetchCart();
    },

    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }

});


const [removeFromCart] = useMutation(RemoveFromCart,{
    
    onCompleted:()=>{
        refetchCart();
    },

    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }

});

const [checkout] = useMutation(Checkout,{
    
    onCompleted:()=>{
        refetchCart();
        refetchOrders();
    },

    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }

});


const {
  data: ordersData,
  loading: ordersLoading,
  error: ordersError,
  refetch: refetchOrders
} = useQuery(MyOrders);

const orders = ordersData?.myOrders || [];
  
const { 
    data: cartData, 
    loading: cartLoading, 
    error: cartError,
    refetch: refetchCart
} = useQuery(ViewCart);


//Staffs_available
const [selectedService, setSelectedService] = useState(null);
const { 
    data: staffsData, 
    loading: staffsLoading,
    error: staffsError,
    refetch: refetchStaffs
} = useQuery(AVAILABLE_STAFFS, {
    variables: {
        serviceId: selectedService?.serviceId
    },
    skip: !selectedService
});


//My_Bookings
const {
  data: MybookingData,
  loading: MybookingLoading,
  error: MybookingError,
  refetch: refetchMybooking
} = useQuery(MY_BOOKINGS);



//New Booking
const [bookingTime, setBookingTime] = useState("");
const [createBooking, {data: bookData, loading: bookLoading, error: bookError}] = useMutation(Booking,{
    onCompleted:()=>{
        refetchMybooking;
    },
    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }
});





//Services
const { 
    data: servicesData, 
    loading: servicesLoading, 
    error: servicesError,
    refetch: refetchServices
} = useQuery(SERVICES);



useEffect(() => {
  
refetchMybooking;
}, [createBooking]);

const [bookingDate, setBookingDate] = useState("");


const [selectedStaffId, setSelectedStaffId] = useState("");

const [requestedPlaces, setRequestedPlaces] = useState(1);

const [errorMessage, setErrorMessage] = useState("");

const [successMessage, setSuccessMessage] = useState("");





const [cancelOrder] = useMutation(CancelOrder,{
    onCompleted:()=>{
        refetchOrders();
    },
    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }
});




const [deletebook] = useMutation(DeleteBooking,{
    onCompleted:()=>{
        refetchMybooking();

    },
    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }
});

//Booking operations
const handleCreateBooking = async (e) => {
    
    e.preventDefault();

    if (!bookingTime) {
        setErrorMessage("Please select a time slot");
        return;
    }

    try {

        const result = await createBooking({
            variables:{
                slotId: bookingTime
            }   , onCompleted:()=>{
        refetchMybooking();
      
    },
        });
       

        console.log("Booking created:", result.data);

        setSuccessMessage("Booking created successfully");

    } catch(err) {

        console.log(err);
        setErrorMessage(
            err.message
        );

    }
};


const handleDeleteBooking = async (bookingid)=>{
  try{
         const result = await deletebook({
            variables:{
                booking_id: bookingid
            }
        });
    
  }catch(err){
    console.log(err);
  }

}


//Staff members mock
const STAFF_MEMBERS = [
    {
        id: 1,
        name: "John",
        specialty: "Strength"
    },
    {
        id: 2,
        name: "Sarah",
        specialty: "Yoga"
    }
];

  const handleAddToCart = async(productId) => {
console.log("Product ID:", productId);
try{   const res = await addToCart({
      variables:{
        productId: productId
      }
    });

    
    
   console.log(res);
  
  }catch(err){
      console.log(err);
    }

  };


    const handleRemoveFromCart = async(productId) => {
console.log("Product ID:", productId);
try{   const res = await removeFromCart({
      variables:{
        productId: productId
      }
    });

    
    
   console.log(res);
  
  }catch(err){
      console.log(err);
    }

  };


      const handleCheckout = async() => {
try{   
  const res = await checkout();
  console.log(res);
  }catch(err){
      console.log(err);
    }

  };


const handleCancelOrder = async(orderId) => {

  try {

    const res = await cancelOrder({
      variables:{
        orderId: orderId
      }
    });

    console.log(res);

  } catch(err){

    console.log(err);

  }

};



  


  if (loading) return <div className="text-center py-10">Loading catalog...</div>;

  if (error) return <div className="text-center py-10 text-red-500">Error loading products.</div>;

  const totalPrice = cartData?.viewCart?.reduce(
    (total,item)=>{

        return total + 
        (item.product.price * item.quantity);

    },
    0

) || 0;


// useEffect(() => {
//   console.log("selectedService:", selectedService);
//   console.log("staffsLoading:", staffsLoading);
//   console.log("staffsError:", staffsError);
//   console.log("staffsData:", staffsData);
// }, [selectedService, staffsLoading, staffsError, staffsData]);
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

<div style={{background:"#f4f4f4",color:"black"}} className='productspage'  >


<div style={{position:"fixed",height:"4.5em" , width:"100%", backgroundColor:"black", color:"white", display:"flex" ,alignContent:'center',alignItems:'center',textAlign:'right'}}>
    <div style={{marginRight:"500px"}}><h1>🏋 FitZone Gym Dashboard</h1></div>
    <div style={{marginLeft:"auto"}}>
    <nav>
      <a href="#bookings">Bookings</a>
        <a href="#products">Products</a>
        <a href="#services">Services</a>
        <a href="#cart">Cart</a>
        <a onClick={handlelogout} style={{ cursor: "pointer" }}>Logout</a>
    </nav>
    </div>
</div>
<br></br>
<br></br>
<br></br>
<br></br>

<div>
<section className="heroa" >
    <h2>Your Fitness Journey Starts Here</h2>
    <p>Premium supplements, equipment, and professional gym services.</p>
</section>




<section id="products" style={{}}>

<h2 className="titlea">Gym Products</h2>

<div className="product-containera">

        {data.products.map((product) => {

          const isOutOfStock = product.stock_state==="Out of Stock";

          return (
            <div key={product.productId} className="producta">
              <div>
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                  alt={product.name}
                  style={{width:"200px", height:"180px"}}
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">{product.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</span>
                  {/* <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                    isOutOfStock
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    
                  </span> */}
                  <span style={{color:'black'}}>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
                </div>

           
              </div>
                <button onClick={() => handleAddToCart(product.productId)}>
               Add To Cart
             </button>
             <div>
             <Link
                  to={`/products/${product.productId}`}
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 rounded-lg transition"
                >
                  View Details
             </Link>
              </div>

            </div>
            
          );
        })}
    <div className="producta">
        <img src="https://via.placeholder.com/200"></img>
        <h3>Whey Protein</h3>
        <p>High quality muscle recovery supplement.</p>
        <span>$45</span>
        <button onclick="addToCart('Whey Protein',45)">
            Add To Cart
        </button>
    </div>


    <div className="producta">
        <img src="https://via.placeholder.com/200"></img>
        <h3>Adjustable Dumbbells</h3>
        <p>Professional home workout equipment.</p>
        <span>$80</span>
        <button onclick="addToCart('Adjustable Dumbbells',80)">
            Add To Cart
        </button>
    </div>


        <div className="producta">
        <img src="https://via.placeholder.com/200"></img>
        <h3>Adjustable Dumbbells</h3>
        <p>Professional home workout equipment.</p>
        <span>$80</span>
        <button onclick="addToCart('Adjustable Dumbbells',80)">
            Add To Cart
        </button>
    </div>


        <div className="producta">
        <img src="https://via.placeholder.com/200"></img>
        <h3>Adjustable Dumbbells</h3>
        <p>Professional home workout equipment.</p>
        <span>$80</span>
        <button onclick="addToCart('Adjustable Dumbbells',80)">
            Add To Cart
        </button>
    </div>





</div>

</section>




<section id="cart" style={{alignContent:'center',textAlign:'center',alignItems:'center'}}>

<h2 >
Shopping Cart
</h2>



<div className="cart-boxa" style={{width:'50%',display:'flex',flexDirection:'column' ,alignContent:'center',alignItems:'center',textAlign:'center'}}>


{
cartLoading && 
<p>Loading cart...</p>
}



{
cartError &&
<p>Error loading cart</p>
}



{
cartData?.viewCart?.map((item)=>(

<div 
key={item.product_id}
className="cart-item"
>
<img style={{width:"100px",height:"100px"}}
src={item.product.imageUrl}
alt={item.product.name}
width="100"
/>
<div style={{alignContent:'center',alignItems:'center',textAlign:'center'}}>
<h3>
{item.product.name}
</h3>
<p>
Quantity: {item.quantity}
</p>
<p>
Price: ${item.product.price}
</p>
<p>
Subtotal: $
{(
item.product.price * item.quantity
).toFixed(2)}
</p>


<button style={{width:'fit-content'}} onClick={()=>handleAddToCart(item.product_id)}>+</button>
&nbsp;
<button style={{width:'fit-content'}} onClick={()=>handleRemoveFromCart(item.product_id)}>-</button>

</div>
<br></br>
</div>

))
}



</div>
<h3>
Total: ${totalPrice.toFixed(2)}
</h3>

<button style={{width:'300px'}} onClick={()=>handleCheckout()} >
Checkout
</button>

</section>






{/*Manage Orders */}
<section style={{textAlign:'center',width:"fit-content" ,alignContent:'center', alignItems:'center',textAlign:'center'}}>
   


        {
  ordersLoading && <p>Loading orders...</p>
}

{
  ordersError && <p>Error loading orders</p>
}
<div style={{ alignContent:'center', alignItems:'center',textAlign:'center'}}>
    <div style={{marginLeft:'9em'}}><h2>My Orders</h2></div>
      <table style={{width:"fit-content",borderSpacing:"20px 10px",backgroundColor:"white" , marginLeft:'18em'}}>

        <thead style={{width:"fit-content"}}>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Products</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody style={{whiteSpace:'break-spaces'}}>

        {orders.map(order => (

          <tr key={order.orderId}>
            <td> #{order.orderId}</td>
            <td>{new Date(order.createdAt).toLocaleDateString()} </td>


            <td>

              {order.items.map(item => (

                <div key={item.orderItemId} style={{width:'100px', height:'40px',overflow:'hidden'}}>{item.product.name} × {item.quantity}</div>

              ))}
            </td>
            <td>${order.totalAmount} </td>
            <td>{order.paymentState}</td>
            <td>{order.orderState}</td>
            <td>
              {
                order.orderState === "pending" && (
                  <button style={{backgroundColor:'red'}}
                    onClick={() => handleCancelOrder(order.orderId)
                    }
                  >
                    Cancel Order
                  </button>
                )
              }


              
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
</section>




{/* 
<section id="services">

<h2 class="titlea">Gym Services</h2>


<div class="service-containera">


<div class="servicea">

<h3>Personal Training</h3>
<p>One-on-one training with certified coaches.</p>
<button onclick="bookService('Personal Training')">
Book Now
</button>

</div>



<div class="servicea">

<h3>Nutrition Coaching</h3>
<p>Customized meal plans for your goals.</p>
<button onclick="bookService('Nutrition Coaching')">
Book Now
</button>

</div>



<div class="servicea">

<h3>Body Assessment</h3>
<p>Professional body composition analysis.</p>
<button onclick="bookService('Body Assessment')">
Book Now
</button>

</div>


</div>

</section> */}

        {/* ================= LEFT SIDE: SERVICES LIST & BOOKING FORM ================= */}
        <section className="services-column" id="services"style={{alignContent:'center',alignItems:'center',textAlign:'center'}} >
          <h3>Available Services</h3>
          <div  style={{display:'flex',flexDirection:'row', flexWrap: 'wrap', gap: '20px'}} >
            {servicesData?.services?.map(service => (
              <div key={service.serviceId} style={{width:'400px' ,height:'200px'}}>
                <div className="service-header">
                  <h4   style={{
    width: "400px",
    height: "24px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    margin: 0,
  }}>{service.name}</h4>
                  <span className="service-price">${service.price.toFixed(2)}</span>
                </div>
                <p   style={{
    height: "48px", // 2 lines
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    margin: "10px 0",
  }}>{service.description}</p>
                <div className="service-metadata">
                  <span><strong>Duration:</strong> {service.durationMins}</span>
                  <span>
                    <strong>Type:</strong> { `Group Class (Max Capacity: ${service.capacity})`}
                  </span>
                </div>
                <button 
                  onClick={() => { setSelectedService(service); 
                      setBookingTime("");
                    setErrorMessage("");
                  setSuccessMessage("");
                  console.log("Selected service:", service);setErrorMessage(''); setSuccessMessage(''); }}
                  className="btn-select-service"
                >
                  Book Service
                </button>
              </div>
            ))}
          </div>


          

          {/* Dynamic Booking Window */}
          {selectedService && (
            <div className="booking-form-modal">
                 <h4>Book: {selectedService.name}</h4>

           
              <form onSubmit={handleCreateBooking} className="booking-form">
                                {/* Conditional fields based on booking strategy */}
                {selectedService ? (
                  <div className="form-group">
<label>Select Staff Member:</label>

<select
  required
  value={selectedStaffId}
  onChange={e => setSelectedStaffId(e.target.value)}
>

<option value="">
  -- Choose Staff --
</option>


{
  [...new Map(
    staffsData?.availableStaffs
      ?.filter(st => st.service.serviceId === selectedService.serviceId)
      .map(st => [st.staff.user_id, st])
  ).values()]
  .map(st => (
    <option
      key={st.staff.user_id}
      value={st.staff.user_id}
    >
      {st.staff.email}
    </option>
  ))
}


</select>

                  </div>
                ) : (
                  <div className="form-group">
                    <label>Number of Places (Max {selectedService.capacity}):</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={selectedService.capacity} 
                      value={requestedPlaces} 
                      onChange={e => setRequestedPlaces(e.target.value)} 
                    />
                  </div>
                )}
                
                {/* <div className="form-group">
                  <label>Select Date:</label>
                  <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                </div> */}

                    {selectedStaffId ?
                <div className="form-group">
                  <label>Select Time:</label>
                  <select required value={bookingTime} onChange={e => {console.log("Selected slot:", e.target.value); setBookingTime(e.target.value)}}>
              <option>choose a time</option>
              {staffsData?.availableStaffs?.filter(st => st.service.serviceId === selectedService.serviceId &&  String(st.staff.user_id) === String(selectedStaffId)).map(st => (
                       
                        <option key={st.slot_id} value= {st.slot_id} >{new Date(Number(st.startTime)).toLocaleString("en-GB", {
  timeZone: "Asia/Beirut",
  hour12: false
})}--- {new Date(Number(st.endTime)).toLocaleString("en-GB", {
  timeZone: "Asia/Beirut",
  hour12: false
})}</option>
                        
                      ))}
                  </select>
                </div>:null}

              

                {errorMessage && <div className="error-alert">{errorMessage}</div>}
                {successMessage && <div className="success-alert">{successMessage}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn-confirm-booking">Request Booking</button>
                  <button type="button" className="btn-cancel-modal" onClick={() => setSelectedService(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </section>










<section style={{textAlign:'center',width:"fit-content" ,alignContent:'center', alignItems:'center',textAlign:'center'}} id='bookings'>
{   MybookingLoading && <p>Loading bookings...</p>}
{
MybookingError &&  <p>Error loading bookings</p>
}

{console.log(MybookingError)}





{MybookingData && (
  
  <div style={{ marginTop: "30px" }}>
    <h3>Booking Details</h3>

    <table
      border="1"
      cellPadding="10"
   style={{width:"100%",borderSpacing:"20px 10px",backgroundColor:"white" , marginLeft:'0px'}}
    >
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Service</th>
          <th>Trainer</th>
          <th>Customer</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Created</th>
          <th>Action</th>
        </tr>
      </thead>

     <tbody style={{whiteSpace:'break-spaces'}}>
  {MybookingData.myBookings.map((booking) => (
    <tr key={booking.bookingId}>
      <td>{booking.bookingId}</td>

      <td>{booking.slot.service.name}</td>

      <td>{booking.slot.staff.email}</td>

      <td>{booking.user.email}</td>

      <td>
        {new Date(Number(booking.slot.start_time)).toLocaleString("en-GB", {
          timeZone: "Asia/Beirut",
        })}
      </td>

      <td>
        {new Date(Number(booking.slot.end_time)).toLocaleString("en-GB", {
          timeZone: "Asia/Beirut",
        })}
      </td>

      <td>{booking.bookingState}</td>

      <td>{booking.paymentState}</td>

      <td>
        {new Date(Number(booking.createdAt)).toLocaleString("en-GB", {
          timeZone: "Asia/Beirut",
        })}
      </td>
      <td><button onClick={()=>handleDeleteBooking(booking.bookingId)}>Delete</button></td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
)}
</section>






















</div>





<footer style={{width:"100%"}}>

<p>
© 2026 FitZone Gym Store
</p>

</footer>


</div>


  );

} 

