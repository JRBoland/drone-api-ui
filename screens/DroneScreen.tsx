import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { useAuth } from '../utils/authContext'
import { fetchDrones } from '../services/droneService'
import { Drone, DroneApiResponse } from '../interfaces/drone'
import { RootStackParamList } from '../interfaces/rootStackParamList'

const DroneScreen: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([])
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: DroneApiResponse = await fetchDrones()
        console.log('data is', response)
        setDrones(response.data)
      } catch (error) {
        console.error('Error fetching drones:', error)
      }
    }

    fetchData()
  }, [])

  console.log('length of drones array:', drones.length)

  const handleManageDrones = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType: 'Drones' })
    } else if (Platform.OS === 'web') {
      window.alert('Authentication required to manage drones, Please log in')
      navigation.navigate('Login')
    } else {
      console.log('not authenticated')
      Alert.alert('Authentication required to manage drones', 'Please log in', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ])
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleManageDrones}>
        <Text style={styles.buttonText}>𝌶 Manage Drones</Text>
      </Pressable>
      <FlatList
        data={drones}
        ListEmptyComponent={<Text style={styles.text}>No drones found</Text>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text
            style={styles.text}
          >{`ID: ${item.id}, Name: ${item.name}, Weight: ${item.weight}`}</Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    backgroundColor: '#f0f0f0',
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    margin: 10,
    width: 180,
    backgroundColor: 'beige',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  text: {
    margin: 10,
    color: '#000',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
})

export default DroneScreen
