import apiClient from './client';
import type { User } from '@/types/loan';

interface LoginResponse {
  status: string;
  user?: User;
  message?: string;
}

interface RegisterResponse {
  status: string;
  message?: string;
}

export const login = async (userId: string, password: string): Promise<LoginResponse> => {
  const { data } = await apiClient.post('/api/login', { user_id: userId, password });
  return data;
};

export const register = async (userData: {
  user_id: string;
  password: string;
  company_name: string;
  ceo_name: string;
  business_number: string;
  phone: string;
}): Promise<RegisterResponse> => {
  const { data } = await apiClient.post('/api/register', userData);
  return data;
};
