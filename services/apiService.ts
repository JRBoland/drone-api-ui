import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/', // may need to change between 127.0.0.1:3000 or 192.168.1.105:3000
});


export default api;