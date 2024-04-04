import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
  isAuthenticated: false, // default
  login: () => {},
  logout: () => {},
});

// type definition for props
type AuthProviderProps = {
  children: ReactNode; // Children prop to allow any reactnode to be rendered inside AuthProvider
};

export const useAuth = () => useContext(AuthContext);

// to be used in app.tsx
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
