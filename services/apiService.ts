import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.105:3000/', // may need to change
});

export default api;