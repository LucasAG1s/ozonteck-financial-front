import api,{handleApiError} from "@/lib/axios";
import { IBankAccount } from "@/interfaces/finance/BankAccountInterface";


export type CreateBankAccountPaylod = Omit<IBankAccount, 'id' | 'created_at' | 'updated_at'>
export type UpdateBankAccountPayload = Partial<CreateBankAccountPaylod>;
export type UpdateBankAccountResponse = IBankAccount;


export async function getBanksAccount(company:number): Promise<IBankAccount[]>
{
    try{
        const response = await api.get<IBankAccount[]>(`/api/bank-account/`,{
            params:{
                company_id:company
            }
        });
        return response.data;
    }catch(error){
       throw handleApiError(error, 'Ocorreu um erro ao buscar as contas bancárias.');
    }
}

/**
 * @param payload
 */

export async function createBankAccount(company:number, payload: CreateBankAccountPaylod): Promise<IBankAccount>{
    try{
        const response = await api.post<IBankAccount>(`/api/bank-account/create/`,{
            company,
            ...payload
        });
        return response.data;
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao criar a conta bancária.');
    }
}

/**
 * @param id 
 * @param payload 
 */
export async function updateBankAccount(id:number, payload: UpdateBankAccountPayload): Promise<IBankAccount>{
    try{
        const response = await api.post<UpdateBankAccountResponse>(`/api/bank-account/update/${id}`, payload);
        return response.data;
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao atualizar a conta bancária.');
    }
}
