import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import './details.css';

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

  if (loading) return <div className="status-message">Loading details...</div>;
  if (error || !data?.product) return <div className="status-message error">Product not found.</div>;

  const { product } = data;
  const isOutOfStock = product.stockState === "Out of Stock";

  return (
    <div className="product-details-container">
      <Link to="/products" className="back-link">&larr; Back to Catalog</Link>
      
      <div className="product-card" style={{width:'500px'}}>
        {/* Left Side: Product Image */}
        <div className="product-image-wrapper" >
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/400?text=No+Image'} 
            alt={product.name} 
            className="product-image"
          />
        </div>
        

        {/* Right Side: Product Details */}
        <div className="product-info-wrapper">
          <div className="product-main-details">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
          </div>

          <div className="product-actions-wrapper">
            <div className="stock-status-container">
              <span className={`status-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                {isOutOfStock ? 'Temporarily Out of Stock' : product.stockState}
              </span>
            </div>
            
            {/* <button disabled className="btn-coming-soon">
              Add to Cart (Coming Soon)
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}