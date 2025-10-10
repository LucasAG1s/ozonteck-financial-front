import api,{handleApiError} from "@/lib/axios";





export interface BankAccount{
    id:number
    company_id:number
    bank_name:string
    account:number
    agency:number
    account_type:string
}

export type CreateBankAccountPaylod = Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>
export type UpdateBankAccountPayload = Partial<CreateBankAccountPaylod>;
export type UpdateBankAccountResponse = BankAccount;


export async function getBanksAccount(company:number): Promise<BankAccount[]>
{
    try{
        const response = await api.get<BankAccount[]>(`/api/bank-account/`,{
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

export async function createBankAccount(company:number, payload: CreateBankAccountPaylod): Promise<BankAccount>{
    try{
        const response = await api.post<BankAccount>(`/api/bank-account/create/`,{
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
export async function updateBankAccount(id:number, payload: UpdateBankAccountPayload): Promise<BankAccount>{
    try{
        const response = await api.post<UpdateBankAccountResponse>(`/api/bank-account/update/${id}`, payload);
        return response.data;
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao atualizar a conta bancária.');
    }
}
