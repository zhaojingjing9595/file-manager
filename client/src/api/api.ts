// client/src/services/api.ts
import axios from 'axios';
import { auth } from '../firebase';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const api = axios.create({
  baseURL: API_BASE_URL,
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