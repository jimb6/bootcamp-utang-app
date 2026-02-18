import { apiClient } from './apiClient';
import type {
  Offer,
  CreateOfferRequest,
  UpdateOfferRequest,
} from '@/types';

const BASE_PATH = '/offers';

export const offerService = {
  async getAll(): Promise<Offer[]> {
    return apiClient.get<Offer[]>(BASE_PATH);
  },

  async getById(id: number): Promise<Offer> {
    return apiClient.get<Offer>(`${BASE_PATH}/${id}`);
  },

  async getByBorrowerId(borrowerId: number): Promise<Offer[]> {
    return apiClient.get<Offer[]>(BASE_PATH, {
      params: { borrowerId },
    });
  },

  async create(data: CreateOfferRequest): Promise<Offer> {
    return apiClient.post<Offer>(BASE_PATH, data);
  },

  async update(id: number, data: UpdateOfferRequest): Promise<Offer> {
    return apiClient.put<Offer>(`${BASE_PATH}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
