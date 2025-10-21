import api, { handleApiError } from '@/lib/axios';
import { IDashboardData } from '@/interfaces/finance/DashboardInterface';


export async function getDashboardData(startDate: string, endDate: string, company: string): Promise<IDashboardData> {
    try {
      const response = await api.get<IDashboardData>('/api/dashboard', {
        params: {
          start_date: startDate,
          end_date: endDate,
          company_id: company
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Ocorreu um erro ao buscar os dados do dashboard.');
    }
}