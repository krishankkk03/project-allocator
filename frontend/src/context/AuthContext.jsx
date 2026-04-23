import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const requestLogin = async (email, password) => {
    await axios.post('https://project-allocator.onrender.com/api/auth/login', { email, password });
  };

  const verifyLogin = async (email, otp) => {
    const res = await axios.post('https://project-allocator.onrender.com/api/auth/verify-login', { email, otp });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data.user;
  };

  const requestRegister = async (data) => {
    await axios.post('https://project-allocator.onrender.com/api/auth/register', data);
  };

  const verifyRegister = async (email, otp) => {
    await axios.post('https://project-allocator.onrender.com/api/auth/verify-register', { email, otp });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, requestLogin, verifyLogin, requestRegister, verifyRegister, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
