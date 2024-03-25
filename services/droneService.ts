import axios, { AxiosError } from 'axios'
import api from './apiService'
import { ApiResponse } from '../components/DronesUi'


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