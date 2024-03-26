import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import api from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../utils/authContext';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  }
}

// not sure on what prop type to use here
const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('attempting login with ', username, password)
    try {
      console.log("Sending request to /auth/login endpoint");
      const response = await api.post('auth/login', { username, password });
      console.log("Login response data:", response.data);
      const { access_token } = response.data;
      console.log("Received access token:", access_token);
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('username', username);
      console.log(access_token); 
      navigation.navigate('Home'); // Navigate to the Home screen upon successful login passing username as prop
      login()
    } catch (err) {
      console.error("Login error:", err);
      setError('Failed to login. Please check your details.');
    }
  };

  return (
    <View style={styles.container}>
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
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LoginScreen;
