import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const login = (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', name);
    setIsLoggedIn(true);
    setUsername(name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setLoginData({ email: '', password: '' });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout, loginData, setLoginData }}>
      {children}
    </AuthContext.Provider>
  );
};