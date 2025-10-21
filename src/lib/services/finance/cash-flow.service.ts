import api, { handleApiError } from "@/lib/axios";
import { ICashFlowData } from "@/interfaces/finance/CashFlowInterface";


export async function getCashFlow( startDate: string, endDate: string, companyId: number,bankAccountId?: number | null): Promise<ICashFlowData> {
  try {
    const response = await api.get<ICashFlowData>('/api/cash-flow', {
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