import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.1.102:3000/', // may need to change between 127.0.0.1:3000 or 192.168.1.105:3000
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
