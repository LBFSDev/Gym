import React, { createContext, useContext, useState, useEffect } from 'react';

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useApolloClient } from "@apollo/client/react";


//authentication state manager
const AuthContext = createContext(null);

const ME_QUERY = gql`
  query GetMe {
    me {
      user_id
      email
      role
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gym_auth_token');
      if (token) {
        try {
          const { data } = await client.query({
            query: ME_QUERY,
            fetchPolicy: 'network-only',
          });
          setUser(data.me);
        } catch (err) {
          logout(); // Auto-clean on corrupted or expired local storage token
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [client]);

  const login = (token, userData) => {
    localStorage.setItem('gym_auth_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gym_auth_token');
    setUser(null);
    client.clearStore();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);