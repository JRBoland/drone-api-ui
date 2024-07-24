import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native'
import axios from 'axios'
import api from '../services/apiService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../utils/authContext'

type Props = {
  navigation: {
    navigate: (screen: string) => void
  }
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('userToken')
      if (isAuthenticated || token) {
        navigation.navigate('Home')
      }
    }
    checkAuthentication()
  }, [navigation, isAuthenticated])

  const handleLogin = async () => {
    try {
      const response = await api.post('auth/login', { username, password })
      const { access_token } = response.data
      await AsyncStorage.setItem('userToken', access_token)
      await AsyncStorage.setItem('username', username)
      navigation.navigate('Home')
      login()
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to login. Please check your username and password.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.titleText}>Drone Flight Logger</Text>
        <Text style={styles.loginTitle}>Login:</Text>
        <View style={styles.loginFieldsContainer}>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>
        </View>
        <br />
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: '#00CECB' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: '#FF5E5B' }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFEA',
    paddingTop: 40,
  },
  button: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    width: 220,
    backgroundColor: '#FFED66',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
  loginTitle: {
    paddingTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 40,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  loginContainer: {
    margin: 40,
    width: 300,
  },
  loginFieldsContainer: {
    marginVertical: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
})

export default LoginScreen
