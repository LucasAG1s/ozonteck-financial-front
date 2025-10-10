import api, { handleApiError } from "@/lib/axios";
import { BankAccount } from "./banks.service";
import { Supplier } from "./supllier.service";
import { AccountPlan } from "./account-plan.service";
import { PaymentMethod } from "./payment-methods.service";

export interface Expense {
    id:number
    company_id:number
    supplier_id:number
    bank_account_id:number
    account_plan_id:number
    payment_method_id:number
    amount:string
    expense_date:string
    description:string
    file_path:string 
    created_at:string
    updated_at:string
    supplier: Supplier | null
    account_plan: AccountPlan | null
    payment_method: PaymentMethod | null
    bank: BankAccount | null
}


export type CreateExpensePayload = Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'supplier' | 'account_plan' | 'bank' | 'payment_method'>;
export type UpdateExpensePayload = Partial<CreateExpensePayload>;


export async function getExpenses(startDate:string, endDate:string, company:string): Promise<Expense[]>{
    try{
        const response = await api.get<Expense[]>('/api/expense',{
            params:{
                start_date:startDate,
                end_date:endDate,
                company_id:company
            }}
        )
        console.log(response.data);
        return response.data
    }catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao buscar as despesas.');
    }
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
    try {
        const response = await api.post<Expense>('/api/expense/create', payload);
        return response.data;
    } catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao criar a despesa.');
    }
}

export async function deleteExpense(id: number): Promise<void> {
    try {
        await api.delete(`/api/expense/delete/${id}`);
    } catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao excluir a despesa.');
    }
}


export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
    try {
        const response = await api.post<Expense>(`/api/expense/update/${id}`, payload);
        return response.data;   
    } catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao atualizar a despesa.');
    }
}

export async function uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post<{ url: string }>('/api/upload/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao enviar o arquivo.');
    }
}




