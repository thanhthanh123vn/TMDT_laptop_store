import axiosClient from './axiosClient';

export const authApi = {
    login: (data: any) => {
        return axiosClient.post('/auth/login', data);
    },
    register: (data: any) => {
        return axiosClient.post('/auth/register', data);
    },
    registerSeller: (data: any) => {
        return axiosClient.post('/auth/register-seller', data);
    },
    verifyRegisterOtp: (data: any) => {
        return axiosClient.post('/auth/verify-register-otp', data);
    },
    forgotPassword: (data: any) => {
        return axiosClient.post('/auth/forgot-password', data);
    },
    verifyOtp: (data: any) => {
        return axiosClient.post('/auth/verify-otp', data);
    },
    resetPassword: (data: any) => {
        return axiosClient.post('/auth/reset-password', data);
    },
    logout: (data: any) => {
        return axiosClient.post('/auth/logout', data);
    },
    refreshToken: (data: any) => {
        return axiosClient.post('/auth/refresh', data);
    },
    loginFirebase: (idToken: string) => {
        return axiosClient.post('/auth/firebase', { idToken });
    }
};
