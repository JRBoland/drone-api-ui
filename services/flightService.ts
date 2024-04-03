//import axios, { AxiosError } from 'axios'
//import api from './apiService'
//import { Flight, FlightApiResponse } from '../interfaces/flight'
//
//
//
//export const fetchFlights = async (): Promise<FlightApiResponse> => {
//  try {
//    const response = await api.get<FlightApiResponse>('flights');
//    console.log(response.data);
//    return response.data;
//  } catch (error) {
//    console.error('Error fetching flights:', error);
//    return { data: [] }; 
//  }
//};
//