import api, {handleApiError} from "@/lib/axios";
import { ICompany } from "@/interfaces/universal/CompanyInterface";



export type NewCompanyPayload = Omit<ICompany, 'id'>;
export type UpdateCompanyPayload = Partial<NewCompanyPayload>;


export async function getCompanies(): Promise<ICompany[]> {
  const response = await api.get<ICompany[]>('/api/companies');
  return response.data;
}

/**
 * @param companyData
 */
export async function createCompany(companyData: NewCompanyPayload): Promise<ICompany> {
  try{
    const response = await api.post<ICompany>('/api/companies/create', companyData)
    return response.data
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao criar a empresa.');
  }
}

/**
 * @param id
 * @param payload 
 */
export async function updateCompany({ id, payload }: { id: number; payload: UpdateCompanyPayload }): Promise<ICompany> {
  try {
    const response = await api.post<ICompany>(`/api/companies/update/${id}`, payload)
    return response.data

  } catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao criar a empresa.');
  }
}

/**
 * @param id 
 */
export async function deleteCompany(id: number): Promise<void> {
  try {
    await api.delete(`/api/companies/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar a empresa.');
  }
}