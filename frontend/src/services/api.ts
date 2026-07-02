import axios from 'axios';

const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/api'
    : '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});
