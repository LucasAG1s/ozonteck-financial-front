import api, { handleApiError } from "@/lib/axios"

export interface AccountPlan {
  id: number;
  name: string;
  parent_id: number | null;
  type: number;
  description:string;
  created_at: string;
  updated_at: string;
  
}

export type CreateAccountPlanPayload = Omit<AccountPlan, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAccountPlanPayload = Partial<CreateAccountPlanPayload>;



export async function getAccountPlans(): Promise<AccountPlan[]> {
  try {
    const response = await api.get<AccountPlan[]>('/api/account-plan');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os planos de contas.');
  }
}


export async function createAccountPlan(payload: CreateAccountPlanPayload): Promise<AccountPlan> {
  try {
    const response = await api.post<AccountPlan>('/api/account-plan/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o plano de contas.');
  }
}

export async function updateAccountPlan(id: number, payload: UpdateAccountPlanPayload): Promise<AccountPlan> {
    try {
      const response = await api.post<AccountPlan>(`/api/account-plan/update/${id}`, payload);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Ocorreu um erro ao atualizar o plano de contas.');
  }
}

export async function deleteAccountPlan(id: number): Promise<void> {
    try {
      await api.delete(`/api/account-plan/delete/${id}`);
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao excluir o plano de contas.');
    }
}