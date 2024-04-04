import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import {
  entityConfigurations,
  ManageEntityScreenParams,
} from '../config/entityConfigurations'
import api from '../services/apiService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { renderFormFields } from '../components/renderFormFields'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios, { AxiosError } from 'axios'

const ManageEntityScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<{ params: ManageEntityScreenParams }, 'params'>>()
  const [operation, setOperation] = useState('')
  const [formData, setFormData] = useState<{
    [key: string]: string | number | boolean
  }>({})
  const [responseMessage, setResponseMessage] = useState('')

  const entityType = route.params?.entityType as string
  const entityConfig = entityType ? entityConfigurations[entityType] : null
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = React.useState(false)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole')
      if (role) {
        setUserRole(role)
      }
    }

    fetchUserRole()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    let formattedValue: string | number | boolean = value

    if (field.endsWith('id') && !isNaN(parseInt(value))) {
      formattedValue = parseInt(value)
    } else if (field === 'weight' && !isNaN(parseFloat(value))) {
      formattedValue = parseFloat(value)
    } else if (field === 'age' && !isNaN(parseInt(value))) {
      formattedValue = parseInt(value)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  // todo: array responses to start at 1
  const formatResponseData = (
    responseData: any,
    operation: string,
    entityType: string
  ): string => {
    // Construct the title from the entityType and operation, adjusting the word as needed
    let operationWord = operation === 'find' ? 'found' : `${operation}d`
    let title = `${
      entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)
    } ${operationWord.charAt(0).toUpperCase() + operationWord.slice(1)}:`
    let formattedResponse = title + '\n\n'

    // Different message for delete operation
    if (operation === 'delete') {
      return `${
        entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)
      } deleted.`
      
    }

    // A recursive function to format nested objects correctly
    const formatObject = (obj: {}): string => {
      return Object.entries(obj)
        .map(([key, value]) => {
          // Skip the 'message' field for direct formatting
          if (key === 'message') return ''
          // Capitalise the first letter of each key and replace underscores with spaces
          let formattedKey =
            key.replace(/_/g, ' ').charAt(0).toUpperCase() +
            key.replace(/_/g, ' ').slice(1)
          // If the value is an object, recursively format it
          if (typeof value === 'object' && value !== null) {
            return `${formattedKey}:\n${formatObject(value).replace(
              /^/gm,
              '  '
            )}\n`
          } else {
            return `${formattedKey}: ${value}`
          }
        })
        .filter((line) => line)
        .join('\n')
    }

    // If there's a direct 'message' property, add it first
    if (responseData.message) {
      formattedResponse += `${responseData.message}\n\n`
    }

    // Format each top-level property in responseData, assuming the actual data might be nested
    Object.entries(responseData).forEach(([key, value]) => {
      if (key !== 'message') {
        // Skip 'message' since it's already handled
        if (typeof value === 'object' && value !== null) {
          formattedResponse += formatObject(value)
        } else {
          let formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
          formattedResponse += `${formattedKey}: ${value}\n`
        }
      }
    })

    return formattedResponse.trim() // Trim trailing whitespace
  }

  const errorStatusMessage = (error: AxiosError) => {
    if (error.response && error.response.status) {
      const { status } = error.response

      switch (status) {
        case 400: // bad request
          return `Your request could not be completed. \nPlease check the required fields and try again.`
        case 400: // unauthorised
          return 'You must be authenticated to complete this action. \nPlease log in and try again.'
        case 403: // forbidden (unauthorised)
          return 'You do not have permission to perform this action.'
        case 404:
          return 'Resource was not found, please check and try again.'
        case 408:
          return 'Request timed out. Please try again'
        case 500:
          return 'An internal server error occurred.'
        default:
          return `An error occurred: ${error.response}`
      }
    } else {
      return `An unknown error occurred: ${error}`
    }
  }

  // API REQUEST
  const apiRequest = async () => {
    const urlBase = `/${entityType.toLowerCase()}`
    try {
      const token = await AsyncStorage.getItem('userToken')
      if (!token) {
        setResponseMessage('No auth token')
        return
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }

      // Reducer funct to only include non-empty fields in the search request
      const nonEmptyFields = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          if (value) acc[key] = value // Only add non-empty values
          return acc
        },
        {}
      )

      let response
      const { id, ...dataWithoutId } = formData
      const urlWithId = id ? `${urlBase}/${id}` : urlBase

      switch (operation) {
        case 'create':
          response = await api.post(urlBase, formData, config)
          break
        case 'update':
          response = await api.put(urlWithId, dataWithoutId, config)
          break
        case 'delete':
          response = await api.delete(urlWithId, config)
          break
        case 'find':
          const searchParams = new URLSearchParams(nonEmptyFields).toString()
          const findUrl = `${urlBase}/search?${searchParams}`
          response = await api.get(findUrl, config)
          break
        default:
          console.log('No operation default switch state triggered')
          return
      }

      if (response && response.data) {
        const responseData = response.data
        const formattedData = formatResponseData(
          responseData,
          operation,
          entityType
        )
        console.log('Response Data:', responseData)
        setResponseMessage(formattedData)
      } else {
        setResponseMessage('Unexpected response format or no data.')
      }
    } catch (error: any) {
      console.error('Request failed:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = errorStatusMessage(error)
        setResponseMessage(`Error: ${errorMessage}`)
      } else {
        setResponseMessage(
          'An unexpected error occurred. Please try again later. (Not Axios)'
        )
      }
    }
  }

  if (!entityType) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Entity Type not specified</Text>
      </View>
    )
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <SafeAreaView style={styles.container}>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

        {/* Manage entity actions*/}
        <Text style={styles.header}>{`Manage ${entityType}`}</Text>
        <Text style={styles.instructionsText}>Click an action below:</Text>
        {['create', 'update', 'delete', 'find'].map((operation) => (
          <Pressable
            key={operation}
            onPress={() => {
              setOperation(operation)
              setFormData({})
              setResponseMessage('')
            }}
            style={styles.button}
          >
            <Text>
              {operation.charAt(0).toUpperCase() + operation.slice(1)} a{' '}
              {entityType.slice(0, -1)}
            </Text>
          </Pressable>
        ))}

        {/* Manage an entity fields*/}
        {operation && (
          <View>
            <Text style={styles.titleText}>
              {operation} a {entityType.slice(0, -1)}
            </Text>
            <Text style={styles.instructionsText}>
              Fill in the relevant fields below to {operation} a{' '}
              {entityType.slice(0, -1)}.
            </Text>
          </View>
        )}

        {/*ID field*/}
        <View style={styles.inputContainer}>
          {['update', 'delete', 'find'].includes(operation) && (
            <View>
              <Text style={{ color: '#ff5e5b' }}>
                {entityType.slice(0, -1)} ID *
              </Text>
              <TextInput
                placeholder={`${entityType.slice(0, -1)} ID`}
                value={formData['id']?.toString() || ''}
                onChangeText={(text) => handleInputChange('id', text)}
                style={[
                  styles.input,
                  formData['id'] ? styles.input : styles.italicPlaceholder,
                ]}
                keyboardType="numeric"
              />
            </View>
          )}
          {/*Other fields*/}
          {renderFormFields({
            entityConfig,
            operation,
            formData,
            setFormData,
            styles,
            handleInputChange,
          })}
        </View>

        {/*Submit changes*/}
        {operation && (
          <Pressable
            onPress={apiRequest}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: pressed ? '#ffed66' : '#00cecb' },
            ]}
          >
            <Text style={styles.submitText}>
              Submit {operation} {entityType.slice(0, -1)}
            </Text>
          </Pressable>
        )}

        <View style={styles.responseMessageContainer}>
          {responseMessage && (
            <Text style={styles.responseText}>{responseMessage}</Text>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: 20,
  },

  inputContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: 220,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#000',
    backgroundColor: '#FFFFEA',
    padding: 10,
  },
  italicPlaceholder: {
    fontStyle: 'italic',
    color: '#999',
    textTransform: 'capitalize',
  },
  button: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginVertical: 6,
    width: 220,
    backgroundColor: '#ffed66',
  },
  submitButton: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 14,
    margin: 20,
    width: 'auto',
    minWidth: 180,
  },
  submitText: {
    textTransform: 'capitalize',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleText: {
    textTransform: 'capitalize',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  responseText: {
    padding: 10,
    backgroundColor: '#FFFAF0',
    borderRadius: 6,
    borderWidth: 2,
    color: '#000',
    textAlign: 'left',
  },
  responseMessageContainer: {
    borderRadius: 5,
    width: 'auto',
    minWidth: 300,
    padding: 10,
    margin: 20,
  },
  instructionsText: {
    width: 200,
    fontStyle: 'italic',
    margin: 20,
  },
  fieldContainer: {
    flexDirection: 'column',
    textAlign: 'left',
    marginVertical: 10,
    width: 220,
    borderColor: '#ff5e5b',
  },
  checkbox: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 10,
    borderColor: '#00cecb',
  },
  checkboxText: {
    color: '#000',
    textTransform: 'capitalize',
    fontSize: 14,
    textDecorationLine: 'none',
  },
  icon: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00cecb',
  },
})

export default ManageEntityScreen
