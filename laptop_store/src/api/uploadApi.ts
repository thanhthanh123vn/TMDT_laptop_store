import axiosClient from './axiosClient';

export const uploadApi = {

    uploadMultipleImages: (files: File[]) => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append("files", file);
        });

        return axiosClient.post("/api/upload/images", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },


    uploadSingleImage: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return axiosClient.post("/api/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
};