// Archivo: frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    // Ajustamos la URL base para que incluya la versión v1 de tu API
    baseURL: 'http://localhost:8000/api/v1', 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Interceptor de Peticiones: Inyecta el Token Bearer si existe
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuestas: Manejo de desautenticación global
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;