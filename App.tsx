import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import DronesUi from './components/DronesUi'

export default function App() {
  return (
    <View style={styles.container}>
      <DronesUi />
      <Text>Testing</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
