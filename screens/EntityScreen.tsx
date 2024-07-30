import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useAuth } from '../utils/authContext'
import {
  fetchEntityData,
  createEntity,
  updateEntity,
  deleteEntity,
} from '../services/entityService'
import { Entity, isDrone, isPilot, isFlight } from '../interfaces/entity'
import { useFocusEffect } from '@react-navigation/native'
import { entityConfigurations } from '../config/entityConfigurations'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome } from '@expo/vector-icons'
import { Switch } from 'react-native'
import { AxiosError } from 'axios'
import { errorStatusMessage } from '../utils/errorUtils'
import Header from '../components/Header'
import EntityCard from '../components/EntityCard'

const EntityScreen: React.FC = () => {
  const route = useRoute()
  const { entityType } = route.params as { entityType: string }
  const [entities, setEntities] = useState<Entity[]>([])
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [pilots, setPilots] = useState<{
    [key: number]: { name: string; flights_recorded?: number }
  }>({})
  const [drones, setDrones] = useState<{ [key: number]: string }>({})
  const config = entityConfigurations[entityType]
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<{ [key: string]: any }>({
    footage_recorded: false,
  })
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [entityType])
  )

  useEffect(() => {
    fetchPilotsAndDrones()
  }, [])

  useEffect(() => {
    filterEntities()
  }, [searchQuery, entities])

  const fetchData = async () => {
    try {
      const response = await fetchEntityData<Entity>(entityType, false)
      const sortedEntities = response.data.sort((a, b) => a.id - b.id)
      setEntities(sortedEntities)
    } catch (error: any) {
      const errorMessage = errorStatusMessage(error)
      console.error(`Error fetching ${entityType.toLowerCase()}:`, errorMessage)
      setError(errorMessage)
    }
  }

  const fetchPilotsAndDrones = async () => {
    try {
      const pilotsResponse = await fetchEntityData<Entity>('pilots', false)
      const dronesResponse = await fetchEntityData<Entity>('drones', false)

      const pilotsData = pilotsResponse.data.reduce(
        (
          acc: { [key: number]: { name: string; flights_recorded?: number } },
          pilot: Entity
        ) => {
          if (isPilot(pilot)) {
            acc[pilot.id] = {
              name: pilot.name,
              flights_recorded: pilot.flights_recorded,
            }
          }
          return acc
        },
        {}
      )

      const dronesData = dronesResponse.data.reduce(
        (acc: { [key: number]: string }, drone: Entity) => {
          if (isDrone(drone)) {
            acc[drone.id] = drone.name
          }
          return acc
        },
        {}
      )

      setPilots(pilotsData)
      setDrones(dronesData)
    } catch (error: any) {
      const errorMessage = errorStatusMessage(error)
      console.error('Error fetching pilots or drones:', errorMessage)
      setError(errorMessage)
    }
  }

  const filterEntities = () => {
    if (searchQuery === '') {
      setFilteredEntities(entities)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = entities.filter((entity) => {
        if (isFlight(entity)) {
          return (
            entity.flight_location.toLowerCase().includes(query) ||
            entity.drone_id.toString().includes(query) ||
            entity.pilot_id.toString().includes(query)
          )
        } else if (isDrone(entity)) {
          return (
            entity.name.toLowerCase().includes(query) ||
            entity.id.toString().includes(query)
          )
        } else if (isPilot(entity)) {
          return (
            entity.name.toLowerCase().includes(query) ||
            entity.id.toString().includes(query)
          )
        }
        return false
      })
      setFilteredEntities(filtered)
    }
  }

  const validateForm = () => {
    const requiredFields = config.fields.filter((field) => field.required)
    for (const field of requiredFields) {
      if (!formData[field.name]) {
        setError(`${field.placeholder} is required.`)
        return false
      }
    }
    setError(null)
    return true
  }

  const handleAddEntity = async () => {
    if (!validateForm()) return

    try {
      const dataToSend = { ...formData }
      console.log('Form data before adding:', dataToSend)

      // Convert fields to their appropriate types and validate number fields
      config.fields.forEach((field) => {
        if (field.type === 'number') {
          const numberValue = Number(dataToSend[field.name])
          if (isNaN(numberValue)) {
            throw new Error(`${field.placeholder} must be a number.`)
          }
          dataToSend[field.name] = numberValue
        } else if (field.type === 'boolean') {
          dataToSend[field.name] =
            dataToSend[field.name] === 'true' || dataToSend[field.name] === true
        }
      })

      await createEntity(entityType, dataToSend)
      setIsAdding(false)
      setFormData({ footage_recorded: false })
      onRefresh()
    } catch (error: any) {
      console.error(`Error adding ${entityType.toLowerCase()}:`, error.message)
      setError(error.message)
    }
  }

  const handleEditEntity = async (id: number) => {
    if (!validateForm()) return

    try {
      const dataToSend = { ...formData }
      console.log('Form data before updating:', dataToSend)

      // Only include fields that have been changed and are not empty strings
      const changedData = Object.keys(dataToSend).reduce((acc, key) => {
        if (dataToSend[key] !== undefined && dataToSend[key] !== '') {
          acc[key] = dataToSend[key]
        }
        return acc
      }, {} as { [key: string]: any })

      // Convert fields to their appropriate types and validate number fields
      config.fields.forEach((field) => {
        if (changedData.hasOwnProperty(field.name)) {
          if (field.type === 'number') {
            const numberValue = Number(changedData[field.name])
            if (isNaN(numberValue)) {
              throw new Error(`${field.placeholder} must be a number.`)
            }
            changedData[field.name] = numberValue
          } else if (field.type === 'boolean') {
            changedData[field.name] =
              changedData[field.name] === 'true' ||
              changedData[field.name] === true
          }
        }
      })

      await updateEntity(entityType, id, changedData)
      setIsEditing({ ...isEditing, [id]: false })
      setFormData({ footage_recorded: false })
      onRefresh()
    } catch (error: any) {
      console.error(
        `Error updating ${entityType.toLowerCase()}:`,
        error.message
      )
      setError(error.message)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  const handleDeleteEntity = async (id: number) => {
    try {
      await deleteEntity(entityType, id)
      onRefresh()
    } catch (error: any) {
      const errorMessage = errorStatusMessage(error)
      console.error(`Error deleting ${entityType.toLowerCase()}:`, errorMessage)
      setError(errorMessage)
    }
  }

  const startEditing = (item: Entity) => {
    setIsEditing({ [item.id]: true })
    setIsAdding(false)
    setFormData({ ...item })
  }

  const startAdding = () => {
    setIsAdding(true)
    setIsEditing({})
    setFormData({ footage_recorded: false }) // Reset form data to initial values
  }

  const startSearch = () => {
    setIsSearchActive(true)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchActive(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        <Header
          entityType={entityType}
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clearSearch={clearSearch}
          startSearch={startSearch}
          startAdding={startAdding}
          isAuthenticated={isAuthenticated}
        />
        {isAdding && (
          <View style={styles.editCard}>
            <Text style={styles.cardTitle}>Add {entityType.slice(0, -1)}</Text>
            {config.fields.map((field) => {
              if (
                field.name === 'footage_recorded' &&
                entityType === 'Flights'
              ) {
                return (
                  <View key={field.name} style={styles.switchContainer}>
                    <Text style={styles.fieldTitle}>
                      {field.placeholder} {field.required && '*'}
                    </Text>
                    <Switch
                      value={!!formData[field.name]}
                      onValueChange={(value) =>
                        handleInputChange(field.name, value)
                      }
                    />
                  </View>
                )
              }
              return (
                <View key={field.name} style={styles.fieldContainer}>
                  <Text style={styles.fieldTitle}>{field.placeholder}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`${field.placeholder}${
                      field.required ? ' *' : ''
                    }`}
                    value={formData[field.name]?.toString() || ''}
                    onChangeText={(text) =>
                      setFormData({ ...formData, [field.name]: text })
                    }
                  />
                </View>
              )
            })}
            <View style={styles.cardButtonsRow}>
              <Pressable onPress={handleAddEntity} style={styles.button}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsAdding(false)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
        <FlatList
          data={filteredEntities}
          ListEmptyComponent={
            <Text
              style={styles.text}
            >{`No ${entityType.toLowerCase()} found.`}</Text>
          }
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <EntityCard
              item={item}
              isEditing={isEditing}
              startEditing={startEditing}
              handleDeleteEntity={handleDeleteEntity}
              pilots={pilots}
              drones={drones}
              isAuthenticated={isAuthenticated}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: '#181818',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
    padding: 10,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  editCard: {
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
    marginBottom: 8,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  input: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
    padding: 10,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  cardButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#ddd',
    minWidth: 140,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  text: {
    marginTop: 4,
    marginHorizontal: 10,
    color: '#555',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  scrollContainer: {
    flexGrow: 1,
  },
})

export default EntityScreen
