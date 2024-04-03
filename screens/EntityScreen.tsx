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
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native'
import { useAuth } from '../utils/authContext'
import { fetchEntityData } from '../services/entityService' // You'll need to implement this based on your existing fetch services.
import { Entity, EntityApiResponse } from '../interfaces/entity' // Define generic interfaces or adjust existing ones.
import { useFocusEffect } from '@react-navigation/native'
import {
  entityConfigurations,
  ManageEntityScreenParams,
} from '../config/entityConfigurations'

const EntityScreen: React.FC = () => {
  const route = useRoute()
  const { entityType } = route.params as { entityType: string }
  const [entities, setEntities] = useState<Entity[]>([])
  const config = entityConfigurations[entityType]
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<any>>()

  const renderEntityItem = (entityType, item) => {
    switch (entityType) {
      case 'Drones':
        return (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
            <Text style={[styles.tableCell, styles.mediumCell]}>
              {item.name}
            </Text>
            <Text style={[styles.tableCell, styles.smallCell]}>
              {item.weight}
            </Text>
          </View>
        )
      case 'Pilots':
        return (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
            <Text style={[styles.tableCell, styles.mediumCell]}>
              {item.name}
            </Text>
            <Text style={[styles.tableCell, styles.smallCell]}>{item.age}</Text>
          </View>
        )
      case 'Flights':
        return (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
            <Text style={[styles.tableCell, styles.idCell]}>
              {item.pilot_id}
            </Text>
            <Text style={[styles.tableCell, styles.idCell]}>
              {item.drone_id}
            </Text>
            <Text style={[styles.tableCell, styles.largeCell]}>
              {item.flight_location}
            </Text>
            {/* renders text based on boolean value */}
            <Text style={[styles.tableCell, styles.smallCell]}>
              {item.footage_recorded ? 'Yes' : 'No'}
            </Text>
          </View>
        )
      default:
        return <View />
    }
  }

  const renderEntityHeader = (entityType) => {
    switch (entityType) {
      case 'Drones':
        return (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.idCell]}>ID</Text>
            <Text style={[styles.headerText, styles.mediumCell]}>Name</Text>
            <Text style={[styles.headerText, styles.smallCell]}>Weight</Text>
          </View>
        )
      case 'Pilots':
        return (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.idCell]}>ID</Text>
            <Text style={[styles.headerText, styles.mediumCell]}>Name</Text>
            <Text style={[styles.headerText, styles.smallCell]}>Age</Text>
          </View>
        )
      case 'Flights':
        return (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.idCell]}>ID</Text>
            <Text style={[styles.headerText, styles.idCell]}>Pilot ID</Text>
            <Text style={[styles.headerText, styles.idCell]}>Drone ID</Text>
            <Text style={[styles.headerText, styles.largeCell]}>
              Flight Location
            </Text>
            <Text style={[styles.headerText, styles.smallCell]}>
              Footage Recorded
            </Text>
          </View>
        )
      default:
        return <View />
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const response: EntityApiResponse<Entity> = await fetchEntityData(
            entityType
          )
          // Assume fetchEntityData handles fetching any entity type based on endpoint.
          const sortedEntities = response.data.sort((a, b) => a.id - b.id) // Assumes all entities have an id.
          setEntities(sortedEntities)
        } catch (error) {
          console.error(`Error fetching ${entityType.toLowerCase()}:`, error)
        }
      }

      fetchData()
    }, [entityType])
  )

  const handleManageEntities = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType })
    } else if (Platform.OS === 'web') {
      window.alert(
        `Authentication required to manage ${entityType}, please log in`
      )
      navigation.navigate('Login')
    } else {
      console.log('not authenticated')
      Alert.alert(
        `Authentication required to manage ${entityType}, please log in`,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.manageContainer}>
        <Pressable style={styles.button} onPress={handleManageEntities}>
          <Text style={styles.buttonText}>{`𝌶 Manage ${entityType}`}</Text>
        </Pressable>
        <Text style={styles.instructionsText}>
          {`Click for more options on managing ${entityType}`}.
        </Text>
      </View>
      <View style={styles.table}>
        <FlatList
          data={entities}
          ListEmptyComponent={
            <Text style={styles.text}>{`No ${entityType} found`}</Text>
          }
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderEntityItem(entityType, item)}
          ListHeaderComponent={() => renderEntityHeader(entityType)}
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
    textDecorationLine: 'underline',
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
  smallCell: {
    flex: 1.5,
  },
  mediumCell: {
    flex: 3,
  },
  largeCell: {
    flex: 4,
  },
})

export default EntityScreen
