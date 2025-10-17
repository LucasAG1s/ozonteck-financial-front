import api, { handleApiError } from "@/lib/axios";

export interface Permission {
  id: number;
  name: string;
  group: string;
  description: string;
}

/**
 * Busca todas as permissões disponíveis no sistema.
 */
export async function getPermissions(): Promise<Permission[]> {
  try {
    const response = await api.get<Permission[]>('/api/permission');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar as permissões.');
  }
}