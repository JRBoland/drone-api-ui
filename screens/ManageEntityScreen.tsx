import React from 'react'
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import {
  RouteProp,
  useRoute,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native'
import { RootStackParamList } from '../interfaces/rootStackParamList'

type ManageEntityScreenRouteProp = RouteProp<RootStackParamList, 'Manage'>
type ManageEntityScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'Manage'
>
const ManageEntityScreen: React.FC = () => {
  const route = useRoute<ManageEntityScreenRouteProp>()
  //const navigation = useNavigation<ManageEntityScreenNavigationProp>()
  const entityType = route.params?.entityType

  if (!entityType) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Entity Type not specified</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{`Manage ${entityType}`}</Text>
      {/* Implement UI for posting, updating, deleting, and finding entities */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
})

export default ManageEntityScreen
