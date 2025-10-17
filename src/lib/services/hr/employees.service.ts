import api, { handleApiError } from "@/lib/axios";

function buildFormData(payload: Record<string, any>, isUpdate: boolean = false): FormData {
    const formData = new FormData();
    if (isUpdate) {
        formData.append('_method', 'POST');
    }
    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }
    return formData;
}

export interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string;
  contracts:any[];
  data:any;
  active: boolean; 
  created_at: string;
  updated_at: string;
}

export type CreateEmployeePayload = Omit<Employee, 'id' | 'created_at' | 'updated_at'|'contracts'|'data'> & { document_number?: string; avatar?: File | null };
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;


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
    const data = buildFormData(payload);

    console.log(data);
    const response = await api.post<Employee>('/api/employee/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
        console.log(response.data)
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
    const response = await api.get<Employee>(`/api/employee/edit/${id}`);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar o colaborador.');
  } 
}