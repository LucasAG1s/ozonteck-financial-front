// src/services/dashboard.service.ts ou .js
import api from '../axios';

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
      console.log(error);
      throw error;
    }
  }