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







export default function ProductsPage() {

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

const [cancelOrder] = useMutation(CancelOrder,{
    onCompleted:()=>{
        refetchOrders();
    },
    onError:(error)=>{
        console.log(error.graphQLErrors);
        console.log(error.networkError);
    }
});


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




  return (

<div style={{background:"#f4f4f4",color:"black"}} className='productspage'  >


<div style={{position:"fixed",height:"4.5em" , width:"100%", backgroundColor:"black", color:"white", display:"flex" ,alignContent:'center',alignItems:'center',textAlign:'right'}}>
    <div style={{marginRight:"500px"}}><h1>🏋 FitZone Gym Dashboard</h1></div>
    <div style={{marginLeft:"auto"}}>
    <nav>
        <a href="#products">Products</a>
        <a href="#services">Services</a>
        <a href="#cart">Cart</a>
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
</div>





<footer style={{width:"100%"}}>

<p>
© 2026 FitZone Gym Store
</p>

</footer>


</div>


  );

} 

