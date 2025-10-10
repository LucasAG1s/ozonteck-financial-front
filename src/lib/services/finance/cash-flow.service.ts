import api, { handleApiError } from "@/lib/axios";

interface Transaction {
  date: string;
  description: string;
  type: 'credit' | 'debit'
  type_label: 'Entrada' | 'Saída'
  amount: number
  balance_previous:number
  balance_later:number
}

export interface CashFlowData {
  initial_balance: string;
  final_balance: string;
  total_entries: string;
  total_expenses: string;
  transactions: Transaction[];
}


export async function getCashFlow( startDate: string, endDate: string, companyId: number,bankAccountId?: number | null): Promise<CashFlowData> {
  try {
    const response = await api.get<CashFlowData>('/api/cash-flow', {
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