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
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { useAuth } from '../utils/authContext'
import { fetchDrones } from '../services/droneService'
import { Drone, DroneApiResponse } from '../interfaces/drone'
import { RootStackParamList } from '../interfaces/rootStackParamList'
import { useFocusEffect } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'

const DroneScreen: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([])
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const response: DroneApiResponse = await fetchDrones()
          console.log('data is', response)
          const sortedDrones = response.data.sort((a, b) => a.id - b.id) // sorts drones by id
          setDrones(sortedDrones)
        } catch (error) {
          console.error('Error fetching drones:', error)
        }
      }

      fetchData()
    }, [])
  )

  console.log('length of drones array:', drones.length)

  const handleManageDrones = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType: 'Drones' })
    } else if (Platform.OS === 'web') {
      window.alert('Authentication required to manage drones, please log in')
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
      <View style={styles.manageContainer}>
        <Pressable style={styles.button} onPress={handleManageDrones}>
          <Text style={styles.buttonText}>𝌶 Manage Drones</Text>
        </Pressable>
        <Text style={styles.instructionsText}>
          Click for more options on managing drones.
        </Text>
      </View>
    <View style={styles.table}>
      <FlatList
        data={drones}
        ListEmptyComponent={<Text style={styles.text}>No drones found</Text>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
            <Text style={[styles.tableCell, styles.nameCell]}>{item.name}</Text>
            <Text style={[styles.tableCell, styles.weightCell]}>{item.weight}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.idCell]}>ID</Text>
            <Text style={[styles.headerText, styles.nameCell]}>Name</Text>
            <Text style={[styles.headerText, styles.weightCell]}>Weight</Text>
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
    padding: 5,
    backgroundColor: '#FFF',
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    marginLeft: 5,
    marginRight: 20,
    marginVertical: 20,
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
    margin: 5,
  },
  idCell: {
    flex: 1,
  },
  nameCell: {
    flex: 3,
  },
  weightCell: {
    flex: 1.5,
  },
})

export default DroneScreen
