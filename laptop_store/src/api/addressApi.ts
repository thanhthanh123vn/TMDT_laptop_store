import axiosClient from './axiosClient';

export const addressApi = {
    getMyAddresses: () => {
        return axiosClient.get('/api/addresses');
    },
    addAddress: (data: any) => {
        return axiosClient.post('/api/addresses', data);
    },
    deleteAddress: (id: number) => {
        return axiosClient.delete(`/api/addresses/${id}`);
    }
};
