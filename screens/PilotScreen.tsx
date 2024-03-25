import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchPilots } from '../services/pilotService';
import { Pilot, PilotApiResponse } from '../interfaces/pilot'

const PilotScreen = () => {
  const [pilots, setPilots] = useState<Pilot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: PilotApiResponse = await fetchPilots();
        console.log('data is', response);
        setPilots(response.data);
      } catch (error) {
        console.error('Error fetching Pilots:', error);
      }
    };

    fetchData();
  }, []);

  console.log('length of pilots array:', pilots.length);

  return (
    <View style={styles.container}>
      {pilots.length === 0 ? (
        <Text>No Pilots found</Text>
      ) : (
        <FlatList
          data={pilots}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={styles.text}>{`ID: ${item.id}, Name: ${item.name}, Weight: ${item.age}`}</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#f0f0f0',
  },
  text: {
    margin: 10,
    color: '#000',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
});

export default PilotScreen;
