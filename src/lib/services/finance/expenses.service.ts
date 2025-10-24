import api, { handleApiError } from "@/lib/axios";
import { IExpense } from "@/interfaces/finance/ExpenseInterface";


export type CreateExpensePayload = Omit<IExpense, 'id' | 'created_at' | 'updated_at' | 'supplier' | 'account_plan' | 'bank' | 'payment_method' | 'file_path'> & { file?: File | null };
export type UpdateExpensePayload = Partial<CreateExpensePayload> & { file?: File | null };

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


export async function getExpenses(startDate:string, endDate:string, company:string): Promise<IExpense[]>{
    try{
        const response = await api.get<IExpense[]>('/api/expense',{
            params:{
                start_date:startDate,
                end_date:endDate,
                company_id:company
            }}
        )
        return response.data
    }catch (error) {
       throw handleApiError(error, 'Ocorreu um erro ao buscar as despesas.');
    }
}

export async function createExpense(payload: CreateExpensePayload): Promise<IExpense> {
    try {
        const data = buildFormData(payload);
        const response = await api.post<IExpense>('/api/expense/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
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


export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<IExpense> {
    try {
        const data = buildFormData(payload, true);
        const response = await api.post<IExpense>(`/api/expense/update/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
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
