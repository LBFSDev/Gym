import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

//Blocks unauthorized viewing of specific dashboard scopes
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-orange-500">
        <span className="animate-spin text-xl">⚡ Loading Gym App...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated requests to Login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect authenticated but unauthorized requests to Home/Default Profile
    return <Navigate to="/" replace />;
  }



  return children;
};