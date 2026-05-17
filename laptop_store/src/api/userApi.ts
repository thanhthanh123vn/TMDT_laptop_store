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
    },
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/api/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
