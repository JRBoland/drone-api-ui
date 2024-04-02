import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import {
  entityConfigurations,
  ManageEntityScreenParams,
} from '../config/entityConfigurations'
import api from '../services/apiService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScrollView } from 'react-native-gesture-handler'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

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

  const renderFormFields = () => {
    if (!entityConfig || operation === '' || operation === 'delete') {
      return null
    }

    return entityConfig.fields.map((field) => {
      const isMandatoryForCreate =
        !('required' in field) || field.required !== false

      const isMandatory =
        (operation === 'create' && isMandatoryForCreate) ||
        (operation === 'update' && field.name === 'id') ||
        (operation === 'delete' && field.name === 'id')

      // renders checkbox if boolean
      if (field.type === 'boolean') {
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <BouncyCheckbox
              isChecked={formData[field.name] === true}
              text={field.placeholder}
              textStyle={styles.checkboxText}
              style={styles.checkbox}
              iconStyle={styles.icon}
              innerIconStyle={{
                borderRadius: 4,
              }}
              fillColor={'#00cecb'}
              onPress={(isChecked) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  [field.name]: isChecked,
                }))
              }}
            />
          </View>
        )
      } else {
        // renders rest of fields
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={{ color: '#ff5e5b' }}>
              {field.placeholder}
              {isMandatory && operation === 'create' ? ' *' : ''}
            </Text>
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
          </View>
        )
      }
    })
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {/* Manage entity actions*/}
      <View style={styles.container}>
        <Text style={styles.header}>{`Manage ${entityType}`}</Text>
        <Text style={styles.instructionsText}>Click an action below:</Text>
        {['create', 'update', 'delete', 'find'].map((operation) => (
          <Pressable
            key={operation}
            onPress={() => {
              setOperation(operation)
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
          {renderFormFields()}
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

        {/*Probably unneccssary? 
        <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: pressed ? '#d8d8d8' : '#00cecb' },
            ]}
          >
            <Text style={styles.submitText}>
              Back to {entityType}
            </Text>
          </Pressable>
          */}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flex: 1,
    alignItems: 'center',

    margin: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    margin: 20,
  },
  input: {
    width: 220,
    marginVertical: 10,
    borderWidth: 2,
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
    borderWidth: 2,
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
