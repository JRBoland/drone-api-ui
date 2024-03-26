import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import AsyncStorage from '@react-native-async-storage/async-storage'

import HomeScreen from './screens/HomeScreen'
import DroneScreen from './screens/DroneScreen'
import PilotScreen from './screens/PilotScreen'
import LoginScreen from './screens/LoginScreen'
import FlightScreen from './screens/FlightScreen'
import ManageEntityScreen from './screens/ManageEntityScreen'

import { AuthProvider, useAuth } from './utils/authContext'

const Stack = createStackNavigator()

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Drones" component={DroneScreen} />
      <Stack.Screen name="Pilots" component={PilotScreen} />
      <Stack.Screen name="Flights" component={FlightScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Drones" component={DroneScreen} />
      <Stack.Screen name="Pilots" component={PilotScreen} />
      <Stack.Screen name="Flights" component={FlightScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Manage" component={ManageEntityScreen} />
    </Stack.Navigator>
  )
}

function AppNavigator() {
  const { isAuthenticated } = useAuth()

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}
