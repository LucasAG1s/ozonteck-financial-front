import api, { handleApiError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface IBank {
  id: number;
  name: string;
  code: string;
}

/**
 * Fetches a list of banks from the API.
 */
export async function getBanks(): Promise<IBank[]> {
  try {
    const response = await api.get<IBank[]>('/api/generic/banks');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar a lista de bancos.');
  }
}

/**
 * Custom hook to fetch and cache the list of banks.
 * Data is considered fresh for 24 hours.
 */
export function useBanks() {
  return useQuery({
    queryKey: ['banks'],
    queryFn: getBanks,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}