import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native'
import { RadioButton } from 'react-native-paper'
import api from '../services/apiService'

type Props = {
  navigation: {
    navigate: (screen: string) => void
  }
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user') // default to 'user'
  const [error, setError] = useState('')

  const handleRegister = async () => {
    try {
      console.log('Starting registration request with:', {
        username,
        password,
        roles: [role],
      })
      const response = await api.post('Users', {
        username,
        password,
        roles: [role],
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
          <View style={styles.radioContainer}>
            <Text style={styles.radioLabel}>Role:</Text>
            <View style={styles.radioOption}>
              <RadioButton
                value="user"
                status={role === 'user' ? 'checked' : 'unchecked'}
                onPress={() => setRole('user')}
              />
              <Text>User</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="admin"
                status={role === 'admin' ? 'checked' : 'unchecked'}
                onPress={() => setRole('admin')}
              />
              <Text>Admin</Text>
            </View>
          </View>
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
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioLabel: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    alignItems: 'center',
  },
})

export default RegisterScreen
