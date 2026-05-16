import axiosClient from './axiosClient';

export const userApi = {
    getMyProfile: () => {
        return axiosClient.get('/api/users/me');
    },
    updateProfile: (data: any) => {
        return axiosClient.put('/api/users/me', data);
    },
    changePassword: (data: any) => {
        return axiosClient.post('/api/users/me/change-password', data);
    }
};
