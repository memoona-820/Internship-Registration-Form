import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public
export const registerInternship = (data) => API.post('/internships', data);
export const fetchActivePrograms = () => API.get('/programs');

// Admin
export const adminLogin = (data) => API.post('/admin/login', data);
export const fetchInternships = () => API.get('/internships');
export const updateInternshipStatus = (id, status) => API.patch(`/internships/${id}/status`, { status });
export const deleteInternship = (id) => API.delete(`/internships/${id}`);

// Admin — Programs
export const fetchAllPrograms = () => API.get('/programs/all');
export const createProgram = (data) => API.post('/programs', data);
export const updateProgram = (id, data) => API.patch(`/programs/${id}`, data);
export const deleteProgram = (id) => API.delete(`/programs/${id}`);
