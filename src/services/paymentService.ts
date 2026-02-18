import { apiClient } from './apiClient';
import type { Payment, CreatePaymentRequest } from '@/types';

const BASE_PATH = '/payments';

export const paymentService = {
  async getAll(): Promise<Payment[]> {
    return apiClient.get<Payment[]>(BASE_PATH);
  },

  async getById(id: number): Promise<Payment> {
    return apiClient.get<Payment>(`${BASE_PATH}/${id}`);
  },

  async getByContractId(contractId: number): Promise<Payment[]> {
    return apiClient.get<Payment[]>(BASE_PATH, {
      params: { contractId },
    });
  },

  async create(data: CreatePaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>(BASE_PATH, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
