import { apiClient } from './apiClient';
import type { DashboardSummary } from '@/types';

const BASE_PATH = '/dashboard';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>(`${BASE_PATH}/summary`);
  },
};
