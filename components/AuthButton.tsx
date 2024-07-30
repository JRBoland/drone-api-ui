import React from 'react';
import { Pressable, Text } from 'react-native';
import { useAuth } from '../utils/authContext';

const AuthButton = ({ navigation }: any) => {
  const { isAuthenticated, logout } = useAuth();

  const handlePress = () => {
    if (isAuthenticated) {
      logout();
      navigation.navigate('Login');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Text
        style={{
          borderWidth: 1,
          borderRadius: 4,
          padding: 10,
          paddingHorizontal: 20,
          margin: 8,
          marginHorizontal: 12,
          backgroundColor: '#fffefc',
          fontFamily: 'SpaceGrotesk_400Regular',
        }}
      >
        {isAuthenticated ? 'Logout' : 'Login'}
      </Text>
    </Pressable>
  );
};

export default AuthButton;
