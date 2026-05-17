import axiosClient from './axiosClient';

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

export const categoryApi = {
  getAllCategories: () => axiosClient.get<Category[]>('/api/categories'),
};
