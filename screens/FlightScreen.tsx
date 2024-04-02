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
      Alert.alert(
        'Authentication required to manage flights',
        'Please log in',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.manageContainer}>
        <Pressable style={styles.button} onPress={handleManageFlights}>
          <Text style={styles.buttonText}>𝌶 Manage Flights</Text>
        </Pressable>
        <Text style={styles.instructionsText}>
          Click for more options on managing flights.
        </Text>
      </View>
    <View style={styles.table}>
      <FlatList
        data={flights}
        ListEmptyComponent={<Text style={styles.text}>No flights found</Text>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.id}</Text>
            <Text style={styles.tableCell}>{item.pilot_id}</Text>
            <Text style={styles.tableCell}>{item.drone_id}</Text>
            <Text style={styles.tableCell}>{item.flight_location}</Text>
            <Text style={styles.tableCell}>{item.footage_recorded}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>ID</Text>
            <Text style={styles.headerText}>Pilot ID</Text>
            <Text style={styles.headerText}>Drone ID</Text>
            <Text style={styles.headerText}>Flight Location</Text>
            <Text style={styles.headerText}>Footage Recorded</Text>
          </View>
        )}
      />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    margin: 20,
    width: 180,
    backgroundColor: '#ffed66',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  text: {
    marginTop: 4,
    marginHorizontal: 10,
    color: '#000',
    backgroundColor: '#d8d8d8',
    padding: 10,
    borderRadius: 6,
  },
  manageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionsText: {
    width: 160,
    fontStyle: 'italic',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d8d8d8',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    padding: 10,
    borderRightWidth: 2,
    borderColor: '#d8d8d8',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#00cecb',
    paddingVertical: 10,
    backgroundColor: '#ffed66',
    textDecorationLine: 'underline'
  },
  headerText: {
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  table: {
    margin: 20,
  }
})

export default FlightScreen
