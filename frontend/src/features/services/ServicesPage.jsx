// src/pages/ServicesPage.jsx
import React from 'react';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Link, useNavigate  } from 'react-router-dom';


export const GET_SERVICES = gql`
  query GetServices {
    services {
      serviceId
      name
      description
      price
      durationMins
      capacity
    }
  }
`;

export default function ServicesPage() {
  const { loading, error, data } = useQuery(GET_SERVICES);

  if (loading) return <div className="text-center py-10">Loading services...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading services.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Premium Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.services.map((service) => (
          <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col justify-between">
            <div>
              <img 
                src={ 'https://via.placeholder.com/400x250?text=Service'} 
                alt={service.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{service.name}</h2>
                  <span className="text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-1 rounded">
                    {service.duration_min}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-3">{service.description}</p>
              </div>
            </div>
            
            <div className="p-6 pt-0 flex items-center justify-between">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${service.price.toFixed(2)}</span>
              {/* Booking flow is disabled as per Quality Rule instructions */}
              <button 
                disabled 
                className="bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-bold py-2 px-4 rounded-lg cursor-not-allowed text-sm"
              >
                Book Session (Coming Soon)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}