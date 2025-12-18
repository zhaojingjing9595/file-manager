// client/src/services/api.ts
import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Request Interceptor: Runs before EVERY request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    // getIdToken(true) will automatically refresh the token if it's expired
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;