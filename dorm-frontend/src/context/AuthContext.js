import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../service/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  const login = async (id, password, userType) => {
    try {
      // Catch errors to prevent throwing
      const response = await authAPI.login(id, password, userType).catch(err => {
        const msg = err.response?.data?.message || err.message || 'Login failed';
        return { data: { success: false, message: msg } };
      });

      const data = response.data;

      if (data.success) {
        const userData = {
          id: data.userId,
          name: data.name,
          email: data.email,
          userType: data.userType || data.role || data.type,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }

      // Backend validation errors
      const msg = data.message?.toLowerCase() || '';
      let errorMessage = 'Login failed';

     // First, check ID existence and password
    if (msg.includes('not exist') || msg.includes('not found') || msg.includes('no user')) {
      errorMessage = "ID doesn't exist";
    } else if (msg.includes('password') || msg.includes('invalid credentials')) {
      errorMessage = 'Wrong password. Try again';
    } 
    // THEN check role
    else {
      errorMessage = `Choose role correctly`;
    }
      return { success: false, message: errorMessage };

    } catch (err) {
      // Safety net
      return { success: false, message: 'Unexpected error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
