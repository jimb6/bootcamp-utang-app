import { apiClient } from './apiClient';
import type {
  Borrower,
  CreateBorrowerRequest,
  UpdateBorrowerRequest,
} from '@/types';

const BASE_PATH = '/borrowers';

export const borrowerService = {
  async getAll(): Promise<Borrower[]> {
    return apiClient.get<Borrower[]>(BASE_PATH);
  },

  async getById(id: number): Promise<Borrower> {
    return apiClient.get<Borrower>(`${BASE_PATH}/${id}`);
  },

  async create(data: CreateBorrowerRequest): Promise<Borrower> {
    return apiClient.post<Borrower>(BASE_PATH, data);
  },

  async update(id: number, data: UpdateBorrowerRequest): Promise<Borrower> {
    return apiClient.put<Borrower>(`${BASE_PATH}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
