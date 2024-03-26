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

export const fetchDroneById = async (id: number): Promise<Drone> => {
  try {
    const response = await api.get<Drone>(`drones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drone by ID:', error);
    throw error; 
  }
};

