// src/pages/ProductDetailsPage.jsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import './style.css'

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      productId
      name
      description
      price
      stockState
      imageUrl
    }
  }
`;




export default function ProductDetailsPage() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_PRODUCT, { variables: { id } });
  console.log(""+id);

  if (loading) return <div className="text-center py-10">Loading details...</div>;
  if (error || !data?.product) return <div className="text-center py-10 text-red-500">Product not found.</div>;

  const { product } = data;
  const isOutOfStock = product.stockState=="Out of Stock";;

  return (

<body>

    <div className="product-card">
      <Link to="/products" className="text-indigo-600 hover:text-indigo-500 font-medium mb-6 inline-block">&larr; Back to Catalog</Link>
      <div className="product-info">
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/400?text=No+Image'} 
          alt={product.name} 
          className="w-full h-80 object-cover rounded-lg"
        />
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{product.description}</p>
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {isOutOfStock ? 'Temporarily Out of Stock' : `(${product.stockState})`}
              </span>
            </div>
            {/* Purchase action disabled as per Quality Rule instructions */}
            <button 
              disabled 
              className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
            >
              Add to Cart (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>

</body>

  );
}