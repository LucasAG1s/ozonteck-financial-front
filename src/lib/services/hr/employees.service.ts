import api, { handleApiError } from "@/lib/axios";
import { IEmployee, IEmployeeAddress, IEmployeeBank, IEmployeeContract, IEmployeeData} from "@/interfaces/HR/EmployeeInterface";

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


export type CreateEmployeePayload = Omit<IEmployee, 'id' | 'created_at' | 'updated_at'|'contracts'|'data'|'address'|'bank' | 'payments'> & { document_number?: string; avatar?: File | null };
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;


export async function getEmployees(companyId: number): Promise<IEmployee[]> {
  try {
    const response = await api.get<IEmployee[]>('/api/employee', {
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


export async function createEmployee(payload: CreateEmployeePayload): Promise<IEmployee> {
  try {
    const data = buildFormData(payload);

    console.log(data);
    const response = await api.post<IEmployee>('/api/employee/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
        console.log(response.data)
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o colaborador.');
  }
}


export async function updateEmployee(id: number, payload: UpdateEmployeePayload): Promise<IEmployee> {
  try {
    const response = await api.post<IEmployee>(`/api/employee/update/${id}`, payload);

    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o colaborador.');
  }
}

export type UpdateEmployeeGeneralPayload = Partial<Pick<IEmployee, 'name' | 'email' | 'phone'>>;
export async function updateEmployeeGeneral(id: number, payload: UpdateEmployeeGeneralPayload): Promise<IEmployee> {
  try {
    const response = await api.post<IEmployee>(`/api/employee/update/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados gerais do colaborador.');
  }
}

export type UpdateEmployeeDataPayload = Partial<Omit<IEmployeeData, 'id' | 'employee_id' | 'avatar'>>;
export async function updateEmployeeData(id: number, payload: UpdateEmployeeDataPayload): Promise<IEmployeeData> {
  try {
    const response = await api.post<IEmployeeData>(`/api/employee/update-data/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados adicionais do colaborador.');
  }
}


export type UpdateEmployeeAddressPayload = Partial<Omit<IEmployeeAddress, 'id' | 'employee_id'>>;
export async function updateEmployeeAddress(id: number, payload: UpdateEmployeeAddressPayload): Promise<IEmployeeAddress> {
  try {
    const response = await api.post<IEmployeeAddress>(`/api/employee/update-address/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o endereço do colaborador.');
  }
}

export type UpdateEmployeeBankPayload = Partial<Omit<IEmployeeBank, 'id' | 'employee_id'>>;
export async function updateEmployeeBank(id: number, payload: UpdateEmployeeBankPayload): Promise<IEmployeeBank> {
  try {
    const response = await api.post<IEmployeeBank>(`/api/employee/update-bank/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados bancários do colaborador.');
  }
}

export type CreateContractPayload = Omit<IEmployeeContract, 'id' | 'sector'>;

export async function createContract(payload: CreateContractPayload): Promise<IEmployeeContract> {
  try {
    const response = await api.post<IEmployeeContract>('/api/employee/contract/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o contrato.');
  }
}

export type UpdateContractPayload = Partial<Omit<IEmployeeContract, 'id' | 'employee_id' | 'sector'>>;

export async function updateContract(contractId: number, payload: UpdateContractPayload): Promise<IEmployeeContract> {
  try {
    const response = await api.post<IEmployeeContract>(`/api/employee/contract/update/${contractId}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o contrato.');
  }
}

export async function deleteContract(contractId: number): Promise<void> {
  try {
    await api.delete(`/api/employee/contract/delete/${contractId}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o contrato.');
  }
}


export async function deleteEmployee(id: number): Promise<void> {
  try {
    await api.delete(`/api/employees/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o colaborador.');
  }
}

export async function getEmployeeById(id: number): Promise<IEmployee> {
  try {
    const response = await api.get<IEmployee>(`/api/employee/edit/${id}`);
    console.log(response.data);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar o colaborador.');
  } 
}