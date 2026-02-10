import apiClient from './client';
import type { LoanApplication } from '@/types/loan';

export const submitApplication = async (appData: {
  applicant_id: string;
  company_name: string;
  ceo_name: string;
  property_address: string;
  loan_amount: number;
  loan_duration?: number;
}): Promise<any> => {
  const { data } = await apiClient.post('/api/applications', appData);
  return data;
};

export const getApplications = async (applicantId?: string): Promise<LoanApplication[]> => {
  const params = applicantId ? { applicant_id: applicantId } : {};
  const { data } = await apiClient.get('/api/applications', { params });
  return data;
};

export const updateApplicationStatus = async (appId: string, status: string): Promise<any> => {
  const { data } = await apiClient.put(`/api/applications/${appId}/status?status=${status}`);
  return data;
};
