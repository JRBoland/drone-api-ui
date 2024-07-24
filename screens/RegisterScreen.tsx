import React, { useState } from 'react'
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native'
import api from '../services/apiService'

type Props = {
  navigation: {
    navigate: (screen: string) => void
  }
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async () => {
    try {
      const rolesArray = roles.split(',').map((role) => role.trim())
      console.log('Starting registration request with:', {
        username,
        password,
        roles: rolesArray,
      })
      const response = await api.post('Users', {
        username,
        password,
        roles: rolesArray,
      })
      console.log('Registration response:', response.data)
      navigation.navigate('Login')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Failed to register. Please try again.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.registerContainer}>
        <Text style={styles.titleText}>Register</Text>
        <View style={styles.registerFieldsContainer}>
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
          <TextInput
            placeholder="Role? (enter 'admin' for admin)"
            value={roles}
            onChangeText={setRoles}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: '#FF5E5B' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
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
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 40,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  registerContainer: {
    margin: 40,
    width: 300,
  },
  registerFieldsContainer: {
    marginVertical: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
})

export default RegisterScreen
