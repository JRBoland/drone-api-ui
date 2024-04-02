import React, { useState, useEffect } from 'react'
import { View, Pressable, Text, StyleSheet, Platform, Alert } from 'react-native'
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
      if (Platform.OS === 'web') {
        window.alert('You have logged out')
      } else {
        Alert.alert('You have logged out')
      }
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
      <Text style={styles.welcomeText}>Hello {username} 👋 </Text>
      <Text style={styles.instructionsText}>Select an option: </Text>
      <View style={styles.buttonsContainer}>
      <Pressable style={styles.button} onPress={handleGetDrones}>
        <Text style={styles.buttonText}>Drones</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleGetPilots}>
        <Text style={styles.buttonText}>Pilots</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleGetFlights}>
        <Text style={styles.buttonText}>Flights</Text>
      </Pressable>
      </View>
      <Pressable
        style={[styles.button, isAuthenticated ? { backgroundColor: '#FF5E5B'} : { backgroundColor: '#00cecb'}, { marginTop: 24 }]}
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
    backgroundColor: '#ffffea',
    paddingTop: 20,
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    marginVertical: 6,
    width: 180,
    backgroundColor: '#ffed66',
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
    padding: 2,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  buttonsContainer: {
    marginVertical: 36
  },
  instructionsText: {
    width: 180,
    marginTop: 12,
    textAlign: 'left',
    fontStyle: 'italic',
  }
})

export default HomeScreen
