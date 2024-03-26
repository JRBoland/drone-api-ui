import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './screens/HomeScreen'; 
import DroneScreen from './screens/DroneScreen';
import PilotScreen from './screens/PilotScreen';
import LoginScreen from './screens/LoginScreen';

import { AuthProvider } from './utils/authContext';
import { useAuth } from './utils/authContext';

const Stack = createStackNavigator();

function AuthStack() {
  const { isAuthenticated } = useAuth(); 

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Drones" component={DroneScreen} />
          <Stack.Screen name="Pilots" component={PilotScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthStack /> 
      </NavigationContainer>
    </AuthProvider>
  );
}