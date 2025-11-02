import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../service/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (id, password, userType) => {
    try {
      const response = await authAPI.login(id, password, userType);
      const data = response.data;

      if(data.success){
          const userData={
            id:data.userId,
            name:data.name,
            email: data.email,
            userType: data.userType
          }
        
        setUser(userData);
        
        return { success: true };
      }
      else{
        return { success: false, message: data.message || 'login failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};