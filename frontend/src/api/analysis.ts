import apiClient from './client';
import type { AnalysisResponse } from '@/types/loan';

export const analyzeProperty = async (
  companyName: string,
  address: string,
  loanAmount: number
): Promise<AnalysisResponse> => {
  const { data } = await apiClient.post('/api/analyze', {
    company_name: companyName,
    property_address: address,
    loan_amount: loanAmount,
  });
  return data.data;
};

export const getSuggestions = async (field: string, query: string): Promise<string[]> => {
  const { data } = await apiClient.get('/api/suggestions', { params: { field, query } });
  return data;
};
