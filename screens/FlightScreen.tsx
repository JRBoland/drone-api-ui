import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchDrones } from '../services/droneService';
import { Drone, DroneApiResponse } from '../interfaces/drone'

// NEED TO UPDATE ALL OF THIS FOR FLIGHTS

const FlightScreen = () => {
  const [drones, setDrones] = useState<Drone[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: DroneApiResponse = await fetchDrones();
        console.log('data is', response);
        setDrones(response.data);
      } catch (error) {
        console.error('Error fetching drones:', error);
      }
    };

    fetchData();
  }, []);

  console.log('length of drones array:', drones.length);

  return (
    <View style={styles.container}>
      {drones.length === 0 ? (
        <Text style={styles.text}>No drones found.</Text>
      ) : (
        <FlatList
          data={drones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={styles.text}>{`ID: ${item.id}, Name: ${item.name}, Weight: ${item.weight}`}</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    backgroundColor: '#f0f0f0',
  },
  text: {
    margin: 10,
    color: '#000',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
});

export default FlightScreen;
