import api, { handleApiError } from '@/lib/axios';

export interface DashboardData {
  cardsData: any;
  chartsData: any;  
}


export async function getDashboardData(startDate: string, endDate: string, company: string): Promise<DashboardData> {
    try {
      const response = await api.get<DashboardData>('/api/dashboard', {
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