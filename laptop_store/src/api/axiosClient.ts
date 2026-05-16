import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080', // Replace with your actual backend URL if different
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để tự động gắn token vào header nếu có
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để xử lý lỗi chung (vd: hết hạn token)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors globally if needed
        if (error.response && error.response.status === 401) {
            // e.g. logout user, clear token
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
