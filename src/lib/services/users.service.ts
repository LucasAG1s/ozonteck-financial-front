import api, { handleApiError } from "@/lib/axios";
import { Permission } from "./permissions.service";

interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null;
  roles: Role[];
  permissions: Permission[]; 
  token:[]
  status: 'ativo' | 'inativo'
  last_access?: string
  created_at: string
}

export type CreateUserPayload = Pick<User, 'name' | 'email' | 'status'> & { login: string; role: string; password?: string; avatar?: File | null; password_confirmation?: string };
export type UpdateUserPayload = Partial<CreateUserPayload>;

function buildFormData(payload: Record<string, any>, isUpdate: boolean = false): FormData {
    const formData = new FormData();
    if (isUpdate) {
        formData.append('_method', 'POST'); 
    }
    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }
    return formData;
}



export async function getUsers(): Promise<User[]> {
  try {
    const response = await api.get<User[]>('/api/user');

    console.log(response.data)
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os usuários.');
  }
}


export async function createUser(payload: CreateUserPayload): Promise<User> {
  try {
    const data = buildFormData(payload);
    const response = await api.post<User>('/api/user/create', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o usuário.');
  }
}


export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  try {
    const data = buildFormData(payload, true);
    const response = await api.post<User>(`/api/user/update/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o usuário.');
  }
}

/**
 * Exclui um usuário.
 */
export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/api/user/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o usuário.');
  }
}

/**
 * Sincroniza as permissões de um usuário.
 * @param userId - O ID do usuário.
 * @param permissionIds - Um array com os IDs das permissões a serem atribuídas.
 */
export async function syncUserPermissions(userId: number, permissionIds: number[]): Promise<void> {
    try {
        await api.post(`/api/permission/sync/${userId}`, { permissions: permissionIds });
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao salvar as permissões do usuário.');
    }
}