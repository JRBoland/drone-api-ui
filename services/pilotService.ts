//import axios, { AxiosError } from 'axios'
//import api from './apiService'
//import { Pilot, PilotApiResponse } from '../interfaces/pilot'
//
//
//
//export const fetchPilots = async (): Promise<PilotApiResponse> => {
//  try {
//    const response = await api.get<PilotApiResponse>('pilots');
//    console.log(response.data);
//    return response.data;
//  } catch (error) {
//    console.error('Error fetching pilots:', error);
//    return { data: [] }; 
//  }
//};