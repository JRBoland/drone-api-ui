import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Switch,
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { Entity, isDrone, isPilot, isFlight } from '../interfaces/entity'

const EntityCard = ({
  item,
  isEditing,
  startEditing,
  handleDeleteEntity,
  pilots,
  drones,
  isAuthenticated,
  handleInputChange,
  handleEditEntity,
  formData,
  setIsEditing,
  setFormData,
}: any) => {
  if (isEditing[item.id]) {
    return (
      <View style={styles.editCard}>
        <Text style={styles.cardTitle}>
          Edit {item.entityType.slice(0, -1)} (ID: {item.id})
        </Text>
        {item.config.fields.map((field: any) => {
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

const styles = StyleSheet.create({
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
  iconButtons: {
    marginVertical: 10,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
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
})

export default EntityCard
