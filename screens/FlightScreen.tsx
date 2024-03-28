import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native'
import { fetchFlights } from '../services/flightService'
import { Flight, FlightApiResponse } from '../interfaces/flight'
import { useAuth } from '../utils/authContext'
import { RootStackParamList } from '../interfaces/rootStackParamList'
import { useFocusEffect } from '@react-navigation/native'
import { useNavigation, NavigationProp } from '@react-navigation/native'

const FlightScreen = () => {
  const [flights, setFlights] = useState<Flight[]>([])
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: FlightApiResponse = await fetchFlights()
        console.log('data is', response)
        setFlights(response.data)
      } catch (error) {
        console.error('Error fetching flights:', error)
      }
    }

    fetchData()
  }, [])

  console.log('length of flights array:', flights.length)

  const handleManageFlights = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType: 'Flights' })
    } else if (Platform.OS === 'web') {
      window.alert('Authentication required to manage flights, please log in')
      navigation.navigate('Login')
    } else {
      console.log('not authenticated')
      Alert.alert('Authentication required to manage flights', 'Please log in', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ])
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleManageFlights}>
        <Text style={styles.buttonText}>𝌶 Manage Flights</Text>
      </Pressable>
      {flights.length === 0 ? (
        <Text style={styles.text}>No flights found.</Text>
      ) : (
        <FlatList
          data={flights}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text
              style={styles.text}
            >{`ID: ${item.id}, Flight Date: ${item.flight_date}, Drone ID: ${item.drone_id}, Pilot ID: ${item.pilot_id}, Location: ${item.flight_location}, Footage Recorded: ${item.footage_recorded}`}</Text>
          )}
        />
      )}
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

export default FlightScreen
