import api,{handleApiError} from "@/lib/axios";
import { IEntrie } from "@/interfaces/finance/EntrieInterface";

export type CreateEntryPayload = Omit<IEntrie, 'id' | 'created_at' | 'updated_at' | 'company' | 'account_plan'| 'bank'>;
export type UpdateEntryPayload = Partial<CreateEntryPayload>;
export type UpdateEntryResponse = IEntrie;



export async function getEntries(startDate: string, endDate: string, company: string): Promise<IEntrie[]> {
  try {
    const response = await api.get<IEntrie[]>('/api/entry',{
        params: {
            start_date: startDate,
            end_date: endDate,
            company_id: company
        }
    });
    console.log(response.data)
    return response.data;
  } catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar as entradas.');
  }
}

/**
 * Cria uma nova entrada.
 * @param payload - Os dados da nova entrada.
 */
export async function createEntry(payload: CreateEntryPayload): Promise<IEntrie> {
  try {
    const response = await api.post<IEntrie>('/api/entry/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar a entrada.');
  }
}

/**
 * @param id - O ID da entrada a ser atualizada.
 * @param payload - Os dados a serem atualizados.
 */
export async function updateEntry(id: number, payload: UpdateEntryPayload): Promise<UpdateEntryResponse> {
    try {
        const response = await api.post<UpdateEntryResponse>(`/api/entry/update/${id}`, payload);
        return response.data;
    } catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao atualizar a entrada.');
    }
}

/**
 * @param id - O ID da entrada a ser excluída.
 */
export async function deleteEntry(id: number): Promise<void> {
    try {
        await api.delete(`/api/entry/delete/${id}`);
    } catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao excluir a entrada.');
    }
}
