import axios from "axios";

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('yatrikaToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // lightweight logging for hotel and recommendation endpoints to help debug API shape
    try {
        const url = String(config.url || '');
        if (url.includes('/hotels') || url.toLowerCase().includes('recommend')) {
            console.debug('[API request]', (config.method || 'GET').toUpperCase(), (config.baseURL || '') + url, config.params || {});
        }
    } catch (e) {
        // ignore logging errors
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        try {
            const url = String(response.config?.url || '');
            if (url.includes('/hotels') || url.toLowerCase().includes('recommend')) {
                const data = response.data;
                const sample = Array.isArray(data) ? data.slice(0,2).map(d => Object.keys(d || {})) : Object.keys(data || {});
                console.debug('[API response]', response.status, (response.config?.method || 'GET').toUpperCase(), (response.config?.baseURL || '') + url, 'fields sample:', sample);
            }
        } catch (e) {}
        return response;
    },
    (error) => {
        try {
            const url = String(error.config?.url || '');
            if (url.includes('/hotels') || url.toLowerCase().includes('recommend')) {
                console.warn('[API error]', error.response?.status, (error.config?.method || 'GET').toUpperCase(), (error.config?.baseURL || '') + url, error.response?.data);
            }
        } catch (e) {}
        if (error.response?.status === 401) {
            localStorage.removeItem('yatrikaToken');
            localStorage.removeItem('yatrikaUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    registerOwner: async (userData) => {
        const response = await api.post('/auth/register-owner', userData);
        return response.data;
    },
};

export const imageService = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default api;
