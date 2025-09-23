import api from "../axios";

export interface Company {
    id: number
    corporate_name: string 
    cnpj: string
  }

export async function getCompanies(): Promise<Company[]> {
  const response = await api.get<Company[]>('/api/companies')
  return response.data
}
