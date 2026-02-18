import { apiClient } from './apiClient';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
} from '@/types';

const BASE_PATH = '/contracts';

export const contractService = {
  async getAll(): Promise<Contract[]> {
    return apiClient.get<Contract[]>(BASE_PATH);
  },

  async getById(id: number): Promise<Contract> {
    return apiClient.get<Contract>(`${BASE_PATH}/${id}`);
  },

  async getByBorrowerId(borrowerId: number): Promise<Contract[]> {
    return apiClient.get<Contract[]>(BASE_PATH, {
      params: { borrowerId },
    });
  },

  async create(data: CreateContractRequest): Promise<Contract> {
    return apiClient.post<Contract>(BASE_PATH, data);
  },

  async update(id: number, data: UpdateContractRequest): Promise<Contract> {
    return apiClient.put<Contract>(`${BASE_PATH}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
