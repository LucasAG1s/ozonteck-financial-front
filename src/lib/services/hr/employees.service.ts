import api, { handleApiError } from "@/lib/axios";

export interface Employee {
  id: number;
  company_id: number;
  name: string;
  cpf: string;
  position: string;
  sector_id: number;
  base_salary: string; // A API geralmente lida com valores monetários como string
  admission_date: string;
  phone: string;
  email: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

export type CreateEmployeePayload = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

/**
 * Busca os colaboradores de uma empresa específica.
 */
export async function getEmployees(companyId: number): Promise<Employee[]> {
  try {
    const response = await api.get<Employee[]>('/api/employee', {
      params: {
        company_id: companyId
      }
    });

    console.log(response)
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os colaboradores.');
  }
}


export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  try {
    const response = await api.post<Employee>('/api/employee/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o colaborador.');
  }
}


export async function updateEmployee(id: number, payload: UpdateEmployeePayload): Promise<Employee> {
  try {
    const response = await api.post<Employee>(`/api/employee/update/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o colaborador.');
  }
}


export async function deleteEmployee(id: number): Promise<void> {
  try {
    await api.delete(`/api/employees/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o colaborador.');
  }
}

export async function getEmployeeById(id: number): Promise<Employee> {
  try {
    const response = await api.get<Employee>(`/api/employee/${id}`);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar o colaborador.');
  } 
}