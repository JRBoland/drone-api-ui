import React, { useState, useEffect } from 'react'
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../utils/authContext'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('Guest')
  const { isAuthenticated, logout } = useAuth()

  // grabs username to display. todo: check token is still valid at this point?
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
      navigation.navigate('Login')
    } else {
      navigation.navigate('Login')
    }
  }

  const handleNavigatetoEntity = (entityType: string) => {
    navigation.navigate('Entity', { entityType })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>
        Hello 👋{'\n'}
        {'\n'}
        You are logged in as: {username}{' '}
      </Text>

      <View style={styles.buttonsContainer}>
        <Text style={styles.instructionsText}>Select an option: </Text>
        <Pressable
          style={styles.button}
          onPress={() => handleNavigatetoEntity('Drones')}
        >
          <Text style={styles.buttonText}>Drones</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleNavigatetoEntity('Pilots')}
        >
          <Text style={styles.buttonText}>Pilots</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleNavigatetoEntity('Flights')}
        >
          <Text style={styles.buttonText}>Flights</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            isAuthenticated
              ? { backgroundColor: '#FF5E5B' }
              : { backgroundColor: '#00cecb' },
            { marginTop: 80 },
          ]}
          onPress={handleAuthAction}
        >
          <Text style={styles.buttonText}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fffefc',
  },
  button: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginVertical: 8,
    width: 180,
    backgroundColor: '#ffed66',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  welcomeText: {
    justifyContent: 'center',
    width: 180,
    marginTop: 60,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  buttonsContainer: {
    height: 'auto',
    marginVertical: 100,
  },
  instructionsText: {
    width: 180,
    marginVertical: 12,
    textAlign: 'left',
    fontStyle: 'italic',
    fontFamily: 'SpaceGrotesk_300Light',
  },
})

export default HomeScreen
