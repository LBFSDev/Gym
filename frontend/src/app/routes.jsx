import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import{ LoginForm} from '../features/auth/components/LoginForm'
import{ RegisterForm} from '../features/auth/components/RegisterForm'

// Core Shell Blueprint Setup
const Layout = ({ children }) => (
<div>

</div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Assembling terminal environment...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<> <LoginForm/> </> } />
        <Route path="/Register" element={<> <RegisterForm/> </> } />

      </Routes>
    </Suspense>
  );
}