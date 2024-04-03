// services/entityService.ts
import api from './apiService';
import { EntityApiResponse } from '../interfaces/entity'; 

export const fetchEntityData = async <T>(entityType: string): Promise<EntityApiResponse<T>> => {
  try {
    const response = await api.get<EntityApiResponse<T>>(`${entityType}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw error; 
  }
};
