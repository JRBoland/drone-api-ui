import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

type AuthProviderProps = {
  children: ReactNode; // This type accepts any valid React child (elements, strings, numbers, fragments, etc.)
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    // Ideally should also set the token in AsyncStorage here
  };

  const logout = () => {
    setIsAuthenticated(false);
    AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
