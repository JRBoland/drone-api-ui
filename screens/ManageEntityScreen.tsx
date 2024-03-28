import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import {
  entityConfigurations,
  ManageEntityScreenParams,
} from '../config/entityConfigurations'
import api from '../services/apiService'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ManageEntityScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<{ params: ManageEntityScreenParams }, 'params'>>()
  const [operation, setOperation] = useState('')
  const [formData, setFormData] = useState<{ [key: string]: string | number }>(
    {}
  )
  const [responseMessage, setResponseMessage] = useState('')

  const entityType = route.params?.entityType as string
  const entityConfig = entityType ? entityConfigurations[entityType] : null

  const handleInputChange = (field: string, value: string) => {
    let formattedValue: string | number = value

    if (field === 'weight' && !isNaN(parseInt(value))) {
      formattedValue = parseFloat(value)
    } else if (field === 'age' && !isNaN(parseInt(value))) {
      formattedValue = parseInt(value)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const renderFormFields = () => {
    if (!entityConfig || operation === '' || operation === 'delete') {
      return null
    }

    return entityConfig.fields.map((field) => (
      <TextInput
        key={field.name}
        placeholder={field.placeholder}
        value={formData[field.name]?.toString() || ''}
        onChangeText={(text) => handleInputChange(field.name, text)}
        style={[
          styles.input,
          formData[field.name] ? {} : styles.italicPlaceholder,
        ]}
        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
      />
    ))
  }

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
    if (operation === 'delete' && responseData.id) {
      return `${
        entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)
      } #${responseData.id} deleted.`
    }

    // A recursive function to format nested objects correctly
    const formatObject = (obj: any): string => {
      return Object.entries(obj)
        .map(([key, value]) => {
          // Skip the 'message' field for direct formatting
          if (key === 'message') return ''
          // Capitalize the first letter of each key
          let formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
          // If the value is an object, recursively format it
          if (typeof value === 'object' && value !== null) {
            return `${formattedKey}:\n${formatObject(value).replace(
              /^/gm,
              '  '
            )}`
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

      // Only include non-empty fields in the search request
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
          const searchParams = new URLSearchParams(nonEmptyFields
          ).toString()
          const findUrl = `${urlBase}/search?${searchParams}`
          response = await api.get(findUrl, config)
          break
        default:
          console.log('No operation default switch state triggered')
          return
      }

      if (response && response.data) {
        // Assuming the API always wraps responses in a 'data' field
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
      setResponseMessage(`Error: ${error.message}`)
    }
  }

  if (!entityType) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Entity Type not specified</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{`Manage ${entityType}`}</Text>
      {['create', 'update', 'delete', 'find'].map((operation) => (
        <Pressable
          key={operation}
          onPress={() => {
            setOperation(operation)
            setResponseMessage('')
          }}
          style={styles.button}
        >
          <Text>{operation.charAt(0).toUpperCase() + operation.slice(1)}</Text>
        </Pressable>
      ))}

      {operation && (
        <Text style={styles.titleText}>
          {operation} a {entityType.slice(0, -1)}
        </Text>
      )}
      <View style={styles.responseMessageContainer}>
        {responseMessage && (
          <Text style={styles.responseText}>{responseMessage}</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        {['update', 'delete', 'find'].includes(operation) && (
          <TextInput
            placeholder="ID"
            value={formData['id']?.toString() || ''}
            onChangeText={(text) => handleInputChange('id', text)}
            style={[
              styles.input,
              formData['id'] ? styles.input : styles.italicPlaceholder,
            ]}
            keyboardType="numeric"
          />
        )}

        {renderFormFields()}
      </View>
      {operation && (
        <Pressable onPress={apiRequest} style={styles.submitButton}>
          <Text style={styles.submitText}>
            Submit {operation} {entityType.slice(0, -1)}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: 220,
    marginVertical: 10,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: '#000',
    padding: 10,
  },
  italicPlaceholder: {
    fontStyle: 'italic',
    color: '#999',
    textTransform: 'capitalize',
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    marginVertical: 6,
    width: 180,
    backgroundColor: 'beige',
  },
  submitButton: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    bottom: 180,
    width: 180,
    backgroundColor: 'orange',
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
    backgroundColor: 'beige',
    borderRadius: 6,
    borderWidth: 2,
    color: '#000',
    textAlign: 'left',
  },
  responseMessageContainer: {
    marginTop: 20,
    borderRadius: 5,
  },
})

export default ManageEntityScreen
