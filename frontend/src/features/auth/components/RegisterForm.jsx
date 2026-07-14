import React, { useState } from 'react';
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import './style.css'

const REGISTER_MUTATION = gql`
  mutation register($email: String!, $password: String!) {
    register( email: $email, password: $password) {
      token
      user {
        email
        role
      }
    }
  }
`;

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const [registerUser, { loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      // Auto-logs the user in after registration using your Auth Context
      login(data.register.token, data.register.user);
      navigate('/'); 
    },
    onError: () => {
      setValidationError(''); // Clear local validation errors if server errors occur
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    setValidationError('');
    registerUser({ variables: {  email, password } });
  };

  return (
    <>
      {/* Background ambient neon glow nodes */}
      <div className="blur-glow blur-1"></div>
      <div className="blur-glow blur-2"></div>

      <div className="auth-container">
        <div className="auth-card">
          
          {/* Branding Header */}
          <div className="brand-header">
            <div className="brand-logo">
              <span style={{ fontWeight: 900 }}>IW</span>
            </div>
            <h2 className="brand-title">JOIN THE WORLD</h2>
            <p className="brand-subtitle">Create your athlete profile and start training</p>
          </div>

          {/* Local Validation or Server Error Message Plate */}
          {(validationError || error) && (
            <div 
              style={{
                backgroundColor: 'rgba(127, 29, 29, 0.4)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                color: '#fca5a5',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}
            >
              {validationError || error.message}
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* Full Name Field */}
            {/* <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div> */}

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@gym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper password-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input password-field"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span 
                  className="toggle-pw-label" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ userSelect: 'none' }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper password-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input password-field"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Action Block */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="btn-icon">🔥</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Form */}
          <div className="auth-footer">
            Already have an athlete account? 
            <Link to="/login" className="signup-link">Sign In</Link>
          </div>
        </div>

        {/* External Global Footer */}
        <footer className="external-footer">
          <p className="copyright">© 2026 Iron World. All rights reserved.</p>
          <div className="footer-links">
            <a href="#terms">Terms</a>
            <span className="footer-dot">•</span>
            <a href="#privacy">Privacy</a>
          </div>
        </footer>
      </div>
    </>
  );
};