import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ethio-electronics-backend.onrender.com/api',
});

export default API;