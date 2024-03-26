import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
} from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import { entityConfigurations } from '../config/entityConfigurations'
import {
  ManageEntityScreenParams,
  FieldConfig,
  EntityConfigurations,
} from '../config/entityConfigurations'

const ManageEntityScreen = () => {
  const route =
    useRoute<RouteProp<{ params: ManageEntityScreenParams }, 'params'>>()
  const [operation, setOperation] = useState('')
  const [formData, setFormData] = useState<{ [key: string]: string }>({})

  const entityType = route.params?.entityType
  const entityConfig = entityType ? entityConfigurations[entityType] : null

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const renderFormFields = () => {
    if (!entityConfig || operation === '' || operation === 'delete') {
      return null
    }

    return entityConfig.fields.map((field) => (
      <TextInput
        key={field.name}
        placeholder={field.placeholder}
        value={formData[field.name] || ''}
        onChangeText={(text) => handleInputChange(field.name, text)}
        style={styles.input}
        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
      />
    ))
  }

  const handleSubmit = () => {
    // logic and data sent
    console.log(operation, formData)
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
      {['create', 'update', 'delete', 'find'].map((op) => (
        <Pressable
          key={op}
          onPress={() => setOperation(op)}
          style={styles.button}
        >
          <Text>{op.charAt(0).toUpperCase() + op.slice(1)}</Text>
        </Pressable>
      ))}

      {/* Conditionally render ID input for update, delete, and find operations */}
      {['update', 'delete', 'find'].includes(operation) && (
        <TextInput
          placeholder="ID"
          value={formData['id'] || ''}
          onChangeText={(text) => handleInputChange('id', text)}
          style={styles.input}
          keyboardType="numeric"
        />
      )}

      {renderFormFields()}
      <Button
        title={operation.charAt(0).toUpperCase() + operation.slice(1)}
        onPress={handleSubmit}
      />
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    marginVertical: 6,
    width: 180,
    backgroundColor: 'beige',
  },
})

export default ManageEntityScreen
