import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/password', data)
};

// Members API
export const membersAPI = {
    getAll: (params) => api.get('/members', { params }),
    getById: (id) => api.get(`/members/${id}`),
    getTree: () => api.get('/members/tree'),
    search: (q) => api.get('/members/search', { params: { q } }),
    getAnniversaries: () => api.get('/members/anniversaries'),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`)
};

// News API
export const newsAPI = {
    getAll: (params) => api.get('/news', { params }),
    getLatest: () => api.get('/news/latest'),
    getBySlug: (slug) => api.get(`/news/${slug}`),
    create: (data) => api.post('/news', data),
    update: (id, data) => api.put(`/news/${id}`, data),
    delete: (id) => api.delete(`/news/${id}`)
};

// Albums API
export const albumsAPI = {
    getAll: (params) => api.get('/albums', { params }),
    getFeatured: () => api.get('/albums/featured'),
    getById: (id) => api.get(`/albums/${id}`),
    create: (data) => api.post('/albums', data),
    update: (id, data) => api.put(`/albums/${id}`, data),
    addPhotos: (id, photos) => api.post(`/albums/${id}/photos`, { photos }),
    delete: (id) => api.delete(`/albums/${id}`)
};

// Memorials API
export const memorialsAPI = {
    getAll: () => api.get('/memorials'),
    getByMemberId: (memberId) => api.get(`/memorials/${memberId}`),
    lightIncense: (memberId, data) => api.post(`/memorials/${memberId}/incense`, data),
    addCondolence: (memberId, data) => api.post(`/memorials/${memberId}/condolences`, data),
    update: (memberId, data) => api.put(`/memorials/${memberId}`, data)
};

// Transactions API (Fund management)
export const transactionsAPI = {
    getAll: (params) => api.get('/transactions', { params }),
    getStats: () => api.get('/transactions/stats'),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`)
};

// Users API (Admin management)
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    resetPassword: (id, newPassword) => api.put(`/users/${id}/password`, { newPassword }),
    toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
    delete: (id) => api.delete(`/users/${id}`)
};

// Settings API (Site configuration)
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data)
};

// Demo API (for testing without database)
export const demoAPI = {
    getTree: () => api.get('/demo/tree'),
    getAnniversaries: () => api.get('/demo/anniversaries'),
    getNews: () => api.get('/demo/news'),
    getAlbums: () => api.get('/demo/albums')
};

// Upload API
export const uploadAPI = {
    single: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    multiple: (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return api.post('/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default api;

