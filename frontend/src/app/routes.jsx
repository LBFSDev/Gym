import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import{ LoginForm} from '../features/auth/components/LoginForm'
import{ RegisterForm} from '../features/auth/components/RegisterForm'

import {ProtectedRoute} from '../components/ProtectedRoute.jsx'
import ProductsPage from '../features/products/ProductsPage.jsx';
import ProductDetailsPage from '../features/products/ProductsDetailsPage.jsx';
import Services from '../features/services/services.jsx';
import AdminProductDashboard from '../features/admin/AdminProductDashboard.jsx';

// Core Shell Blueprint Setup
const Layout = ({ children }) => (
<div>

</div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Assembling terminal environment...</div>} >
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<> <LoginForm/> </> } />
        <Route path="/Register" element={<> <RegisterForm/> </> } />


       {/* 1. Customer Protected Routes 
            Accessible to any logged-in user (no specific allowedRoles restriction) */}
        <Route 
          path="/products" 
          element={
            <div style={{width:"100%"}}>
            <ProtectedRoute>
              <ProductsPage/>
            </ProtectedRoute>
            </div>
          } 
        />
        
        <Route 
          path="/products/:id" 
          element={
            <ProtectedRoute>
              <ProductDetailsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          } 
        />


        {/* 2. Admin Only Protected Route
            Explicitly locked down to the 'ADMIN' role */}
        <Route 
          path="/admindashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProductDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
}