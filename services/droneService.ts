import axios, { AxiosError } from 'axios'
import api from './apiService'
import { Drone, DroneApiResponse } from '../interfaces/drone'



export const fetchDrones = async (): Promise<DroneApiResponse> => {
  try {
    const response = await api.get<DroneApiResponse>('drones');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching drones:', error);
    return { data: [] }; 
  }
};