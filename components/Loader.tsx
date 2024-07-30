import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

const Loader = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#00CECB" />
    </View>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default Loader
