import api, { handleApiError } from "@/lib/axios"
import { IAccountPlan } from "@/interfaces/finance/AccountPlanInterface";



export type CreateAccountPlanPayload = Omit<IAccountPlan, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAccountPlanPayload = Partial<CreateAccountPlanPayload>;



export async function getAccountPlans(): Promise<IAccountPlan[]> {
  try {
    const response = await api.get<IAccountPlan[]>('/api/account-plan');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os planos de contas.');
  }
}


export async function createAccountPlan(payload: CreateAccountPlanPayload): Promise<IAccountPlan> {
  try {
    const response = await api.post<IAccountPlan>('/api/account-plan/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o plano de contas.');
  }
}

export async function updateAccountPlan(id: number, payload: UpdateAccountPlanPayload): Promise<IAccountPlan> {
    try {
      const response = await api.post<IAccountPlan>(`/api/account-plan/update/${id}`, payload);
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