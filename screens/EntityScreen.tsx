import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native'
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from '@react-navigation/native'
import { useAuth } from '../utils/authContext'
import {
  fetchEntityData,
  createEntity,
  updateEntity,
  deleteEntity,
} from '../services/entityService'
import { Entity, isDrone, isPilot, isFlight } from '../interfaces/entity'
import { useFocusEffect } from '@react-navigation/native'
import {
  entityConfigurations,
  EntityConfig,
} from '../config/entityConfigurations'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome } from '@expo/vector-icons'
import { Switch } from 'react-native'
import { AxiosError } from 'axios'

const errorStatusMessage = (error: AxiosError) => {
  if (error.response && error.response.status) {
    const { status } = error.response

    switch (status) {
      case 400: // bad request
        return `Your request could not be completed. \nPlease check the required fields and try again.`
      case 401: // unauthorized
        return 'You must be authenticated to complete this action. \nPlease log in and try again.'
      case 403: // forbidden (unauthorized)
        return 'You do not have permission to perform this action.'
      case 404:
        return 'Resource was not found, please check and try again.'
      case 408:
        return 'Request timed out. Please try again'
      case 500:
        return 'An internal server error occurred.'
      default:
        return `An error occurred: ${status}`
    }
  } else {
    return `An unknown error occurred: ${error.message}`
  }
}

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
  const config: EntityConfig = entityConfigurations[entityType]
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<any>>()
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

  const renderCard = ({ item }: { item: Entity }) => {
    if (isEditing[item.id]) {
      return (
        <View style={styles.editCard}>
          <Text style={styles.cardTitle}>
            Edit {entityType.slice(0, -1)} (ID: {item.id})
          </Text>
          {config.fields.map((field) => {
            if (field.name === 'footage_recorded' && isFlight(item)) {
              return (
                <View key={field.name} style={styles.switchContainer}>
                  <Text style={styles.fieldTitle}>
                    {field.placeholder} {field.required && '*'}
                  </Text>
                  <Switch
                    value={
                      formData[field.name] !== undefined
                        ? !!formData[field.name]
                        : !!(item as any)[field.name]
                    }
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
                  value={
                    formData[field.name] !== undefined
                      ? formData[field.name].toString()
                      : (item as any)[field.name]?.toString() ?? ''
                  }
                  onChangeText={(text) => handleInputChange(field.name, text)}
                />
              </View>
            )
          })}
          <View style={styles.cardButtonsRow}>
            <Pressable
              onPress={() => handleEditEntity(item.id)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsEditing({})
                setFormData({ footage_recorded: false }) // Clear form data when cancelling edit
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {isFlight(item) ? (
            <>
              <Text style={styles.cardTitle}>
                {item.flight_location}{' '}
                {item.footage_recorded && (
                  <FontAwesome name="video-camera" size={16} color="black" />
                )}
              </Text>
              <Text style={styles.cardSubtitle}>
                Flight Date: {new Date(item.flight_date).toLocaleDateString()}
              </Text>
              <Text style={styles.cardDetails}>Flight ID: {item.id}</Text>
              <Text style={styles.cardDetails}>
                Drone ID: {item.drone_id}{' '}
                <Text style={{ fontStyle: 'italic' }}>
                  ({drones[item.drone_id]})
                </Text>
              </Text>
              <Text style={styles.cardDetails}>
                Pilot ID: {item.pilot_id}{' '}
                <Text style={{ fontStyle: 'italic' }}>
                  ({pilots[item.pilot_id]?.name})
                </Text>
              </Text>
            </>
          ) : isDrone(item) ? (
            <>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDetails}>ID: {item.id}</Text>
              <Text style={styles.cardDetails}>
                Weight (grams): {item.weight}
              </Text>
            </>
          ) : isPilot(item) ? (
            <>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDetails}>ID: {item.id}</Text>
              <Text style={styles.cardDetails}>Age: {item.age}</Text>
              <Text style={styles.cardDetails}>
                Flights Recorded: {pilots[item.id]?.flights_recorded}
              </Text>
            </>
          ) : null}
        </View>
        {isAuthenticated && (
          <View style={styles.iconButtons}>
            <Pressable
              onPress={() => startEditing(item)}
              style={styles.iconButton}
            >
              <FontAwesome name="pencil" size={24} color="black" />
            </Pressable>
            <Pressable
              onPress={() => handleDeleteEntity(item.id)}
              style={styles.iconButton}
            >
              <FontAwesome name="trash" size={24} color="black" />
            </Pressable>
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{`${entityType} List`}</Text>
        {isSearchActive && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            <Pressable onPress={clearSearch}>
              <FontAwesome name="times" size={24} color="black" />
            </Pressable>
          </View>
        )}
        <View style={styles.headerButtons}>
          {!isSearchActive && (
            <>
              {isAuthenticated && (
                <Pressable onPress={startAdding}>
                  <FontAwesome name="plus" size={24} color="black" />
                </Pressable>
              )}

              <Pressable onPress={startSearch}>
                <FontAwesome name="search" size={24} color="black" />
              </Pressable>
            </>
          )}
        </View>
      </View>
      {isAdding && (
        <View style={styles.editCard}>
          <Text style={styles.cardTitle}>Add {entityType.slice(0, -1)}</Text>
          {config.fields.map((field) => {
            if (field.name === 'footage_recorded' && entityType === 'Flights') {
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
            <Pressable onPress={() => setIsAdding(false)} style={styles.button}>
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
        renderItem={renderCard}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: '#181818',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 20,
    gap: 20,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flex: 1,
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
  card: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    marginVertical: 6,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cardContent: {
    flex: 1,
    flexDirection: 'column',
    padding: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
    marginBottom: 8,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  cardDetails: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  cardButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconButtons: {
    marginVertical: 10,
  },
  cardButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
  fieldContainer: {
    marginBottom: 10,
  },
  fieldTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
})

export default EntityScreen
