import api, { handleApiError } from "@/lib/axios";
import { ITransactionsData, ITransaction } from "@/interfaces/finance/TransactionInterface";


export async function getTransactions( startDate: string, endDate: string, companyId: number,bankAccountId?: number | null): Promise<ITransactionsData> {
  try {
    const response = await api.get<ITransactionsData>('/api/transaction', {
        params: {
            start_date: startDate,
            end_date: endDate,
            company_id: companyId,
            bank_account_id: bankAccountId || undefined
        }
    });
    return response.data;
  } catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar os dados do fluxo de caixa.');
  }
}

export type CreateTransactionPayload = Omit<ITransaction, 'id' | 'created_at' | 'updated_at'|'balance_previous'|'balance_later'>
export async function createTransaction(payload: CreateTransactionPayload): Promise<ITransaction> {
    try {
        const response = await api.post<ITransaction>('/api/transaction/create', payload);
        return response.data;
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao criar a transação.');
    }
}

export async function deleteTransaction(id: number): Promise<void> {
    try {
        await api.delete(`/api/transaction/delete/${id}`);
    } catch (error) {
        throw handleApiError(error, 'Ocorreu um erro ao excluir a transação.');
    }
}