import axios from 'axios'

const api = axios.create({
  baseURL: 'https://3.106.249.164.nip.io/:3000', // to change
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
