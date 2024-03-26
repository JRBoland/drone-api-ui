import React, { useState, useEffect } from 'react'
import { View, Pressable, Text, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../utils/authContext'

const HomeScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('Guest')
  const { isAuthenticated, logout } = useAuth()
  
  
  useEffect(() => {
    const getUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username')
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }

    getUsername()
  }, [])

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await AsyncStorage.removeItem('userToken')
      await AsyncStorage.removeItem('username')
      logout()
    } else {
      navigation.navigate('Login')
    }
  }

  const handleGetDrones = () => {
    navigation.navigate('Drones') // Navigate to DronesScreen
  }

  const handleGetPilots = () => {
    navigation.navigate('Pilots') // Navigate to PilotScreen
  }

  const handleGetFlights = () => {
    navigation.navigate('Flights') // navigate to FlightScreen
  }
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hello {username}</Text>
      <Pressable style={styles.button} onPress={handleGetDrones}>
        <Text style={styles.buttonText}>Drones</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleGetPilots}>
        <Text style={styles.buttonText}>Pilots</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleGetFlights}>
        <Text style={styles.buttonText}>Flights</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: 'orange', marginTop: 24 }]}
        onPress={handleAuthAction}
      >
        <Text style={styles.buttonText}>
          {isAuthenticated ? 'Logout' : 'Login'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  button: {
    borderWidth: 2,
    borderRadius: 2,
    padding: 10,
    marginVertical: 8,
    width: 180,
    backgroundColor: 'beige',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText: {
    textTransform: 'capitalize',
    justifyContent: 'flex-start',
    width: 180,
    margin: 24,
    padding: 10,
  },
})

export default HomeScreen
