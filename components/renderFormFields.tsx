import React from 'react'
import { View, Text, TextInput } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import {
  FieldConfig,
  EntityConfig,
} from '../config/entityConfigurations'

export interface RenderFormFieldsProps {
  entityConfig: EntityConfig| null
  operation: string
  formData: { [key: string]: string | number | boolean }
  setFormData: React.Dispatch<
    React.SetStateAction<{ [key: string]: string | number | boolean }>
  >
  styles: { [key: string]: any } // You can define a more precise type for your styles
  handleInputChange: (field: string, value: string) => void
}

export const renderFormFields = ({
  entityConfig,
  operation,
  formData,
  setFormData,
  styles,
  handleInputChange,
}: RenderFormFieldsProps) => {
  if (!entityConfig || operation === '' || operation === 'delete') {
    return null
  }

  return entityConfig.fields.map((field: FieldConfig) => {
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
