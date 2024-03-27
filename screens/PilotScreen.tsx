import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { fetchPilots } from '../services/pilotService';
import { Pilot, PilotApiResponse } from '../interfaces/pilot'
import { useAuth } from '../utils/authContext'
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../interfaces/rootStackParamList';

const PilotScreen = () => {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const response: PilotApiResponse = await fetchPilots();
          console.log('data is', response);
          const sortedPilots = response.data.sort((a, b) => a.id - b.id);
          setPilots(sortedPilots);
        } catch (error) {
          console.error('Error fetching drones:', error);
        }
      };
  
      fetchData();
    }, [])
  );

  const handleManagePilots = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType: 'Pilots' })
    } else if (Platform.OS === 'web') {
      window.alert('Authentication required to manage pilots, please log in')
      navigation.navigate('Login')
    } else {
      console.log('not authenticated')
      Alert.alert('Authentication required to manage pilots', 'Please log in', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ])
    }
  }

  console.log('length of pilots array:', pilots.length);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleManagePilots}>
        <Text style={styles.buttonText}>𝌶 Manage Pilots</Text>
      </Pressable>
      <FlatList
        data={pilots}
        ListEmptyComponent={<Text style={styles.text}>No pilots found</Text>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text
            style={styles.text}
          >{`ID: ${item.id}, Name: ${item.name}, Age: ${item.age}`}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    backgroundColor: '#f0f0f0',
  },
  button: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    margin: 10,
    width: 180,
    backgroundColor: 'beige',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  text: {
    margin: 10,
    color: '#000',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
});

export default PilotScreen;
