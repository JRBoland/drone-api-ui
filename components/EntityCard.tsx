import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Entity, isDrone, isPilot, isFlight } from '../interfaces/entity';

const EntityCard = ({ item, isEditing, startEditing, handleDeleteEntity, pilots, drones, isAuthenticated }: any) => {
  if (isEditing[item.id]) {
    // Render editing card (similarly refactor the editing card code into its own component if necessary)
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
  );
};

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
});

export default EntityCard;
