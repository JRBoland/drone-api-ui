import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native'
import { fetchPilots } from '../services/pilotService'
import { Pilot, PilotApiResponse } from '../interfaces/pilot'
import { useAuth } from '../utils/authContext'
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import { RootStackParamList } from '../interfaces/rootStackParamList'

const PilotScreen = () => {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const response: PilotApiResponse = await fetchPilots()
          console.log('data is', response)
          const sortedPilots = response.data.sort((a, b) => a.id - b.id)
          setPilots(sortedPilots)
        } catch (error) {
          console.error('Error fetching drones:', error)
        }
      }

      fetchData()
    }, [])
  )

  const handleManagePilots = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType: 'Pilots' })
    } else if (Platform.OS === 'web') {
      window.alert('Authentication required to manage pilots, please log in')
      navigation.navigate('Login')
    } else {
      console.log('not authenticated')
      Alert.alert('Authentication required to manage pilots', 'Please log in', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ])
    }
  }

  console.log('length of pilots array:', pilots.length)

  return (
    <View style={styles.container}>
      <View style={styles.manageContainer}>
        <Pressable style={styles.button} onPress={handleManagePilots}>
          <Text style={styles.buttonText}>𝌶 Manage Pilots</Text>
        </Pressable>
        <Text style={styles.instructionsText}>
          Click for more options on managing pilots.
        </Text>
      </View>
      <View style={styles.table}>
        <FlatList
          data={pilots}
          ListEmptyComponent={<Text style={styles.text}>No pilots found</Text>}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.id}</Text>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.age}</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>ID</Text>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Age</Text>
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
    textDecorationLine: 'underline',
  },
  headerText: {
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  table: {
    margin: 20,
  },
})

export default PilotScreen
