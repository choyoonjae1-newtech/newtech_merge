import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export async function fetchSuggestions(field: string, query: string): Promise<string[]> {
  const response = await axios.get<string[]>(`${API_BASE_URL}/api/suggestions`, {
    params: { field, query },
  });
  return response.data;
}
