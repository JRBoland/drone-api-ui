import React, { useState, useEffect } from 'react'
import { View, Pressable, Text, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../utils/authContext'

const HomeScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('Guest')

  useEffect(() => {
    const getUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username')
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }

    getUsername()
  }, [])

  const { logout } = useAuth()

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken')
    await AsyncStorage.removeItem('username')
    logout()
    //navigation.navigate('Login')
  }

  const handleGetDrones = () => {
    navigation.navigate('Drones') // Navigate to DronesScreen
  }

  const handleGetPilots = () => {
    navigation.navigate('Pilots') // Navigate to PilotScreen
  }
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hello {username}</Text>
      <Pressable style={styles.button} onPress={handleGetDrones}>
        <Text style={styles.buttonText}>Show All Drones</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleGetPilots}>
        <Text style={styles.buttonText}>Show All Pilots</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: 'orange', marginTop: 24, }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
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
  }
})

export default HomeScreen
