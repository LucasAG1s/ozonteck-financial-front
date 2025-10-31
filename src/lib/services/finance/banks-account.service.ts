import api,{handleApiError} from "@/lib/axios";
import { IBankAccount,IBank } from "@/interfaces/finance/BankAccountInterface";
 
export type CreateBankAccountPayload = Omit<IBankAccount, 'id' | 'banks'>;
export type UpdateBankAccountPayload = Partial<CreateBankAccountPayload>;

export async function getBanks(): Promise<IBank[]> {
    try {
        const response = await api.get<IBank[]>('/api/banks');
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao buscar os bancos.');
    }
}

export async function getBanksAccount(company:number): Promise<IBankAccount[]>
{
    try{
        const response = await api.get<IBankAccount[]>(`/api/bank-account`,{
            params:{
                company_id:company
            }
        });
        return response.data;
    }catch(error){
       throw handleApiError(error, 'Ocorreu um erro ao buscar as contas bancárias.');
    }
}

export async function createBankAccount(payload: CreateBankAccountPayload): Promise<IBankAccount> {
    try {
        const response = await api.post<IBankAccount>(`/api/bank-account/create`, payload);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao criar a conta bancária.');
    }
}

export async function updateBankAccount({ id, payload }: { id: number; payload: UpdateBankAccountPayload }): Promise<IBankAccount> {
    try {
        const response = await api.post<IBankAccount>(`/api/bank-account/update/${id}`, payload);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao atualizar a conta bancária.');
    }
}

export async function deleteBankAccount(id: number): Promise<void> {
    try {
        await api.delete(`/api/bank-account/delete/${id}`);
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao excluir a conta bancária.');
    }
}