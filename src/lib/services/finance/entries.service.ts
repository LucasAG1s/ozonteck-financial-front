import api from "@/lib/axios";
import axios from "axios";

// Interfaces para os objetos aninhados na resposta da API
interface EntryCompany {
  id: number;
  corporate_name: string;
}

interface EntryAccountPlan {
  id: number;
  name: string;
}

export interface Entrie {
  id: number;
  company_id: number;
  bank_account_id: number;
  account_plan_id: number | null;
  origin: string;
  amount: string; 
  entry_date: string; 
  description: string;
  created_at: string;
  updated_at: string;
  company: EntryCompany;
  account_plan: EntryAccountPlan | null;
}

export type CreateEntryPayload = Omit<Entrie, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEntryPayload = Partial<CreateEntryPayload>;


function handleApiError(error: unknown, defaultMessage: string): never {
    if(axios.isAxiosError(error) && error.response){
        const apiMessage = error.response.data?.message;
        throw new Error(apiMessage || defaultMessage);
    }
    throw new Error('Ocorreu um erro inesperado de comunicação');
}

/**
 * Busca todas as entradas.
 */
export async function getEntries(startDate: string, endDate: string, company: string): Promise<Entrie[]> {
  try {
    const response = await api.get<Entrie[]>('/api/entry',{
        params: {
            start_date: startDate,
            end_date: endDate,
            company_id: company
        }
    });
    console.log(response);
    return response.data;
  } catch(error){
    handleApiError(error, 'Ocorreu um erro ao buscar as entradas.');
  }
}

/**
 * Cria uma nova entrada.
 * @param payload - Os dados da nova entrada.
 */
export async function createEntry(payload: CreateEntryPayload): Promise<Entrie> {
  try {
    // URL padronizada
    const response = await api.post<Entrie>('/api/entry/create', payload);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Ocorreu um erro ao criar a entrada.');
  }
}

/**
 * Atualiza uma entrada existente.
 * @param id - O ID da entrada a ser atualizada.
 * @param payload - Os dados a serem atualizados.
 */
export async function updateEntry(id: number, payload: UpdateEntryPayload): Promise<Entrie> {
    try {
        const response = await api.post<Entrie>(`/api/entry/update/${id}`, payload);
        return response.data;
    } catch (error) {
        handleApiError(error, 'Ocorreu um erro ao atualizar a entrada.');
    }
}

/**
 * Exclui uma entrada.
 * @param id - O ID da entrada a ser excluída.
 */
export async function deleteEntry(id: number): Promise<void> {
    try {
        await api.delete(`/api/entry/delete/${id}`);
    } catch (error) {
        handleApiError(error, 'Ocorreu um erro ao excluir a entrada.');
    }
}
