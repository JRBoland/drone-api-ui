import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native'
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from '@react-navigation/native'
import { useAuth } from '../utils/authContext'
import { fetchEntityData } from '../services/entityService'
import { Entity, EntityApiResponse } from '../interfaces/entity'
import { useFocusEffect } from '@react-navigation/native'
import { entityConfigurations } from '../config/entityConfigurations'
import {
  renderEntityHeader,
  renderEntityItem,
} from '../components/renderEntityTable'
import { SafeAreaView } from 'react-native-safe-area-context'

const EntityScreen: React.FC = () => {
  const route = useRoute()
  const { entityType } = route.params as { entityType: string }
  const [entities, setEntities] = useState<Entity[]>([])
  const config = entityConfigurations[entityType]
  const { isAuthenticated } = useAuth()
  const navigation = useNavigation<NavigationProp<any>>()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const response: EntityApiResponse<Entity> = await fetchEntityData(
            entityType
          )
          // sorts by ID
          const sortedEntities = response.data.sort((a, b) => a.id - b.id)
          setEntities(sortedEntities)
        } catch (error) {
          console.error(`Error fetching ${entityType.toLowerCase()}:`, error)
        }
      }

      fetchData()
    }, [entityType])
  )

  const handleManageEntities = () => {
    console.log('clicked')
    if (isAuthenticated) {
      navigation.navigate('Manage', { entityType })
    } else if (Platform.OS === 'web') {
      window.alert(
        `Authentication required to manage "${entityType}". Please log in.`
      )
      navigation.navigate('Login')
    } else {
      console.log('not authenticated')
      Alert.alert(
        'Authentication required',
        `Please log in to manage "${entityType}"`,
        [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
          { text: 'Cancel', style: 'cancel' },
        ]
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      <View style={styles.manageContainer}>
        <Text style={styles.entityHeader}>{`${entityType} List`}</Text>
        <Pressable style={styles.button} onPress={handleManageEntities}>
          <Text style={styles.buttonText}>{`𝌶 Manage ${entityType}`}</Text>
        </Pressable>
      </View>
      <View style={styles.table}>
        <FlatList
          data={entities}
          ListEmptyComponent={
            <Text style={styles.text}>{`No ${entityType} found`}</Text>
          }
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderEntityItem(entityType, item)}
          ListHeaderComponent={() => renderEntityHeader(entityType)}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingTop: 5,
    backgroundColor: '#FFF',
  },
  button: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginLeft: 5,
    marginRight: 20,
    marginBottom: 20,
    width: 180,
    backgroundColor: '#ffed66',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  text: {
    marginTop: 4,
    marginHorizontal: 10,
    color: '#000',
    backgroundColor: '#d8d8d8',
    padding: 10,
    borderRadius: 6,
  },
  entityHeader: {
    fontSize: 20,
    paddingHorizontal: 10,
    marginRight: 40,
    justifyContent: 'center',
    height: 40,
  },
  manageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionsText: {
    width: 160,
    fontStyle: 'italic',
  },
  table: {
    margin: 5,
  },
})

export default EntityScreen
