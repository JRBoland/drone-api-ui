import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Button, Pressable, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import DronesScreen from './screens/DroneScreen'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Drones" component={DronesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

type HomeScreenNavigationProp = {
  navigate: (screen: string) => void
}

const HomeScreen = ({
  navigation,
}: {
  navigation: HomeScreenNavigationProp
}) => {
  const handleGetDrones = () => {
    navigation.navigate('Drones') // Navigate to DronesScreen
  }
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleGetDrones}>
          <Text style={[styles.buttonText, { color: 'cadetblue' }]}>
            Show All Drones
          </Text>
        </Pressable>
        {/* below is todo*/}
        <Pressable style={styles.button} onPress={handleGetDrones}>
          <Text style={[styles.buttonText, { color: 'darkslateblue' }]}>
            Find a Drone
          </Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleGetDrones}>
          <Text style={[styles.buttonText, { color: 'darkcyan' }]}>
            Update a Drone
          </Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleGetDrones}>
          <Text style={[styles.buttonText, { color: 'brown' }]}>
            Delete a Drone
          </Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleGetDrones}>
          <Text style={[styles.buttonText, { color: 'darkgreen' }]}>
            Create a Drone
          </Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    borderWidth: 2,
    borderRadius: 2,
    padding: 2,
    marginVertical: 8,
    width: 180,
    backgroundColor: 'beige',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
    textTransform: 'uppercase',
  },
})
