// src/pages/AdminProductDashboard.jsx
import React, { useState } from 'react';
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

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;


const initialFormState = { id: null, name: '', description: '', price: '', stock: 'IN_STOCK', imageUrl: '' };

export default function AdminProductDashboard() {
  const {user , loading:authLoading} = useAuth();
    if (authLoading) {
    return <div className="p-8">Checking permissions...</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-red-500">Access denied.</div>;
  }
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const [formState, setFormState] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Inventory Dashboard</h1>
        <button
          onClick={() => { setFormState(initialFormState); setFormError(''); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Add New Product
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm uppercase">
              <th className="p-4">Product Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {data.products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200">
                <td className="p-4 font-semibold">{product.name}</td>
                <td className="p-4 text-sm max-w-xs truncate">{product.description}</td>
                <td className="p-4">${product.price.toFixed(2)}</td>
                <td className={`p-4 font-medium ${product.stockState === 'Out of Stock'? 'text-red-500' : ''}`}>
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {formState.id ? 'Edit Product Parameters' : 'Create New Inventory Item'}
            </h2>
            
            {formError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* <input
                  type="url"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                /> */}

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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}