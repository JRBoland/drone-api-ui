import axios, { AxiosError } from 'axios'
import api from './apiService'
import { Drone, ApiResponse } from '../interfaces/drone'



export const fetchDrones = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>('drones');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching drones:', error);
    return { data: [] }; 
  }
};