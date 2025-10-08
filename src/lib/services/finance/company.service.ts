import api from "@/lib/axios";
import axios from "axios";


export interface Company {
  id: number;
  corporate_name: string;
  cnpj: string;
  phone_number: string | null;
  trade_name: string | null;
  type: string;
  address_line: string | null;
  city: string | null;
  complement: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  email: string | null;
}


export type NewCompanyPayload = Omit<Company, 'id'>;
export type UpdateCompanyPayload = Partial<NewCompanyPayload>;


export async function getCompanies(): Promise<Company[]> {
  const response = await api.get<Company[]>('/api/companies');
  return response.data;
}

/**
 * @param companyData
 */
export async function createCompany(companyData: NewCompanyPayload): Promise<Company> {
  try{
    const response = await api.post<Company>('/api/companies/create', companyData)
    return response.data
  }catch(error){
    
    if(axios.isAxiosError(error) && error.response){
      const apiMessage = error.response.data?.message
      throw new Error(apiMessage || 'Ocorreu um erro ao criar a empresa')
    }
    throw new Error('Ocorreu um erro inesperado de comunicação')
  }
}

/**
 * @param id
 * @param payload 
 */
export async function updateCompany({ id, payload }: { id: number; payload: UpdateCompanyPayload }): Promise<Company> {
  try {
    const response = await api.patch<Company>(`/api/companies/${id}`, payload)
    return response.data

  } catch (error) {

    if (axios.isAxiosError(error) && error.response) {
      const apiMessage = error.response.data?.message
      throw new Error(apiMessage || 'Ocorreu um erro ao atualizar os dados.');

    }
    throw new Error('Ocorreu um erro inesperado de comunicação.');
  }
}

/**
 * @param id 
 */
export async function deleteCompany(id: number): Promise<void> {
  try {
    await api.delete(`/api/companies/delete/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;
      if (apiMessage) {
        throw new Error(apiMessage);
      }
    }
    throw new Error('Ocorreu um erro inesperado ao tentar excluir a empresa.');
  }
}