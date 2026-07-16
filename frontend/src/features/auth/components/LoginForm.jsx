import React, { useState } from 'react';
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import './Login.css'

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        email
        role
      }
    }
  }
`;

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginUser, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const user = data.login.user;
      login(data.login.token, data.login.user);
    if (user.role === 'customer') {
      navigate('/products');
      // navigate('/Dashboard');
    } else if (user.role === 'admin') {
      navigate('/admindashboard');
    }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({ variables: { email, password } });
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
              {/* Dumbbell / Iron World representation */}
              <span style={{ fontWeight: 900 }}>IW</span>
            </div>
            <h2 className="brand-title">IRON WORLD</h2>
            <p className="brand-subtitle">Log in to your athlete portal</p>
          </div>

          {/* Error Message Plate */}
          {error && (
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
              {error.message}
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>&nbsp;&nbsp;&nbsp;&nbsp;
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
              <div className="label-row">
                <label className="form-label">Password</label>
              </div>
              <div className="input-wrapper password-wrapper">
                <span className="input-icon">🔒</span>&nbsp;&nbsp;&nbsp;&nbsp;
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input password-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                {/* Clean React State toggle replacing the CSS Hack */}
                <span 
                  className="toggle-pw-label" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ userSelect: 'none' }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </span>
              </div>
            </div>

            {/* Remember Me / Forgot Password Interface Options */}
            {/* <div className="form-options">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">Keep me signed in</span>
              </label>
              <a href="#forgot" className="forgot-link">Forgot?</a>
            </div> */}

            {/* Submit Action Block */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="btn-icon">⚡</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an athlete account? 
            <Link to={`/Register`} style={{textDecoration:"none"}} ><span className="signup-link">Register here</span></Link>
            
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