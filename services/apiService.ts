import axios from 'axios'
import { BASE_URL } from '@env';

const api = axios.create({
  baseURL: BASE_URL, // to change
})

// Request interceptor
api.interceptors.request.use(
  (request) => {
    console.log('Starting Request', JSON.stringify(request, null, 2))
    return request
  },
  (error) => {
    console.log('Request Error', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', JSON.stringify(response.data, null, 2))
    return response
  },
  (error) => {
    console.log('Response Error', error)
    return Promise.reject(error)
  }
)

export default api
