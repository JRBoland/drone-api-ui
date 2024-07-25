import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ManageEntityScreen from './screens/ManageEntityScreen';
import { useFonts, SpaceGrotesk_300Light, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AuthProvider, useAuth } from './utils/authContext';
import EntityScreen from './screens/EntityScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createStackNavigator();

const headerStyle = {
  backgroundColor: '#181818',
};

const headerTitleStyle = {
  fontWeight: 'bold',
  fontFamily: 'SpaceGrotesk_700Bold',
  color: '#fffefc',
};

const headerTintColor = '#fffefc';

// Unauthenticated stack
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: headerStyle,
        headerTitleStyle: headerTitleStyle,
        headerTintColor: headerTintColor,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Entity" component={EntityScreen} />
    </Stack.Navigator>
  );
}

// Authenticated stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: headerStyle,
        headerTitleStyle: headerTitleStyle,
        headerTintColor: headerTintColor,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Entity" component={EntityScreen} />
      <Stack.Screen name="Manage" component={ManageEntityScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
