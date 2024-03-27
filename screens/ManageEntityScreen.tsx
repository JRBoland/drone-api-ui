import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import { entityConfigurations } from '../config/entityConfigurations'
import { ManageEntityScreenParams } from '../config/entityConfigurations'
import api from '../services/apiService'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ManageEntityScreen = () => {
  const route =
    useRoute<RouteProp<{ params: ManageEntityScreenParams }, 'params'>>()
  const [operation, setOperation] = useState('')
  const [formData, setFormData] = useState<{ [key: string]: string | number }>({})
  const [text, setText] = useState('')

  const entityType = route.params?.entityType as string
  const entityConfig = entityType ? entityConfigurations[entityType] : null

  const handleInputChange = (field: string, value: string) => {
    let formattedValue: string | number = value;
  
    if (field === 'weight' && !isNaN(parseInt(value))) {
      formattedValue = parseFloat(value);
    } else if (field === 'age' && !isNaN(parseInt(value))) {
      formattedValue = parseInt(value);
    }
  
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
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
        style={[styles.input, formData[field.name] ? {} : styles.italicPlaceholder]}
        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
      />
    ))
  }

  const apiRequest = async () => {
    const urlBase = `/${entityType.toLowerCase()}`;
    
    try {
      const token = await AsyncStorage.getItem('userToken')

      if (!token) {
        console.error('No auth token')
        return
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        'Content-Type': 'application/json', 
      }

      
      let response;
      
      const { id, ...dataWithoutId } = formData;
      const urlWithId = `${urlBase}/${id}`;

      console.log('Request URL:', urlBase)
      console.log('Request Data:', formData)
      console.log('Authorization Token:', token)

      switch (operation) {
        case 'create':
            console.log('Request URL:', urlBase);
            console.log('Request Data:', formData);
            response = await api.post(urlBase, formData, config);
            break;
        case 'update':
            console.log('Request URL:', urlWithId);
            console.log('Request Data:', dataWithoutId);
            response = await api.put(urlWithId, dataWithoutId, config);
            break;
        case 'delete':
            console.log('Request URL:', urlWithId);
            response = await api.delete(urlWithId, config);
            break;
        case 'find':
            console.log('Request URL:', urlWithId);
            response = await api.get(urlWithId, config);
            break;
        default:
            console.log('No operation default switch state triggered');
            return;
    }
  
      console.log('Response:', response.data);

    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  const handleSubmit = () => {
    // logic and data sent
    console.log(operation, formData)
    apiRequest()
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

      {/* Operation Buttons */}
      {['create', 'update', 'delete', 'find'].map((operation) => (
        <Pressable
          key={operation}
          onPress={() => setOperation(operation)}
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

      {/* Conditionally render ID input for update, delete, and find operations */}
      <View style={styles.inputContainer}>
        {['update', 'delete', 'find'].includes(operation) && (
          <TextInput
            placeholder="ID"
            value={formData['id']?.toString() || ''}
            onChangeText={(text) => handleInputChange('id', text)}
            style={[
              styles.input,
              text ? styles.input : styles.italicPlaceholder,
            ]}
            keyboardType="numeric"
          />
        )}

        {renderFormFields()}
      </View>
      {operation && (
        <Pressable onPress={handleSubmit} style={styles.submitButton}>
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
})

export default ManageEntityScreen