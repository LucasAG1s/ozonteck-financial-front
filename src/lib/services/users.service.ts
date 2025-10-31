import api, { handleApiError } from "@/lib/axios";
import { User } from "@/interfaces/UserInterface";

export type CreateUserPayload = Pick<User, 'name' | 'email' | 'active'> & { login: string; role: string; password?: string; avatar?: File | null; password_confirmation?: string };
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

export async function meUpdate(payload: UpdateUserPayload): Promise<void> {
  try{
    await api.post(`/api/user/me/update`,payload)
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados do usuário.');
  }
}