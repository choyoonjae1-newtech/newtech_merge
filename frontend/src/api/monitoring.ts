import apiClient from './client';
import type { MonitoringResponse } from '@/types/loan';

export const getMonitoringLoans = async (): Promise<MonitoringResponse> => {
  const { data } = await apiClient.get('/api/monitoring');
  return data;
};

export const getMonitoringLoanDetail = async (loanId: string): Promise<any> => {
  const { data } = await apiClient.get(`/api/monitoring/${loanId}`);
  return data;
};

export const addMonitoringLoan = async (loanData: any): Promise<any> => {
  const { data } = await apiClient.post('/api/monitoring', loanData);
  return data;
};
