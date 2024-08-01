import React from 'react'
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

const Header = ({
  entityType,
  isSearchActive,
  searchQuery,
  setSearchQuery,
  clearSearch,
  startSearch,
  startAdding,
  isAuthenticated,
}: any) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{`${entityType} List`}</Text>
      {isSearchActive && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <Pressable onPress={clearSearch}>
            <FontAwesome name="times" size={24} color="black" />
          </Pressable>
        </View>
      )}
      <View style={styles.headerButtons}>
        {!isSearchActive && (
          <>
            {isAuthenticated && (
              <Pressable onPress={startAdding}>
                <FontAwesome name="plus" size={24} color="black" />
              </Pressable>
            )}

            <Pressable onPress={startSearch}>
              <FontAwesome name="search" size={24} color="black" />
            </Pressable>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: '#181818',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 20,
    gap: 20,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
    padding: 10,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
})

export default Header
