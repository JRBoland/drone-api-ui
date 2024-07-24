import api from './apiService'
import { EntityApiResponse } from '../interfaces/entity'
import AsyncStorage from '@react-native-async-storage/async-storage'

const getAuthConfig = async () => {
  const token = await AsyncStorage.getItem('userToken')
  if (!token) {
    throw new Error('No auth token found')
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const fetchEntityData = async <T>(
  entityType: string,
  authRequired: boolean = false
): Promise<EntityApiResponse<T>> => {
  try {
    const config = authRequired ? await getAuthConfig() : {}
    const response = await api.get<EntityApiResponse<T>>(
      `${entityType}`,
      config
    )
    return response.data
  } catch (error: unknown) {
    console.error(
      `Error fetching ${entityType}:`,
      error instanceof Error ? error.message : error
    )
    throw error
  }
}

export const createEntity = async <T>(
  entityType: string,
  data: T
): Promise<void> => {
  try {
    const config = await getAuthConfig()
    console.log('Creating entity with data:', data) // Log the data being sent
    const response = await api.post(`${entityType}`, data, config)
    console.log('Create response:', response.data) // Log the response
  } catch (error: unknown) {
    console.error(
      `Error creating ${entityType}:`,
      error instanceof Error ? error.message : error
    ) // Log detailed error
    throw error
  }
}

export const updateEntity = async <T>(
  entityType: string,
  id: number,
  data: Partial<T>
): Promise<void> => {
  try {
    const config = await getAuthConfig()
    console.log('Updating entity with data:', data) // Log the data being sent
    const response = await api.put(`${entityType}/${id}`, data, config)
    console.log('Update response:', response.data) // Log the response
  } catch (error: unknown) {
    console.error(
      `Error updating ${entityType}:`,
      error instanceof Error ? error.message : error
    ) // Log detailed error
    throw error
  }
}

export const deleteEntity = async (
  entityType: string,
  id: number
): Promise<void> => {
  try {
    const config = await getAuthConfig()
    const response = await api.delete(`${entityType}/${id}`, config)
    console.log('Delete response:', response.data) // Log the response
  } catch (error: unknown) {
    console.error(
      `Error deleting ${entityType}:`,
      error instanceof Error ? error.message : error
    ) // Log detailed error
    throw error
  }
}
