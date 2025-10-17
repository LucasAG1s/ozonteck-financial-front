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

export interface EmployeeData {
  id: number;
  employee_id: number;
  document_number: string;
  birth_date: string;
  marital_status: string;
  gender: string;
  avatar?: string;
}

export interface EmployeeAddress {
  id: number;
  employee_id: number;
  address_line: string;
  complement: string | null;
  neighborhood: string;
  number: string;
  zip_code: string;
  city_id: number;
  state_id: number;
  country_id: number;
}

export interface EmployeeBank {
  id: number;
  employee_id: number;
  bank_id: number;
  agency_number: number;
  account_number: number;
  account_type: string;
  pix_key: string;
}

export interface EmployeePayments{
  id:number
  employee_id:number
  company_id:number
	type:String
  amount:string	
  reference_month: string; // Changed from dateFns to string
  paid_at: string; // Changed from dateFns to string
  }

export interface EmployeeContract {
  id: number;
  employee_id: number;
  company_id: number;
  contract_type: string;
  admission_date: string;
  salary: string;
  position: string | null;
  active: number;
  sector_id: number;
  is_unionized: number; // Added based on console log
  work_schedule: string | null; // Added based on console log
  sector: { id: number; name: string; }; // Added based on console log
}

export interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string;
  contracts: EmployeeContract[];
  data: EmployeeData;
  address: EmployeeAddress;
  bank: EmployeeBank; 
  payments: EmployeePayments[]; 
  active: boolean; 
  created_at: string;
  updated_at: string;
}

export type CreateEmployeePayload = Omit<Employee, 'id' | 'created_at' | 'updated_at'|'contracts'|'data'|'address'|'bank'> & { document_number?: string; avatar?: File | null };
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

export type UpdateEmployeeGeneralPayload = Partial<Pick<Employee, 'name' | 'email' | 'phone'>>;
export async function updateEmployeeGeneral(id: number, payload: UpdateEmployeeGeneralPayload): Promise<Employee> {
  try {
    const response = await api.post<Employee>(`/api/employee/update/general/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados gerais do colaborador.');
  }
}

export type UpdateEmployeeDataPayload = Partial<Omit<EmployeeData, 'id' | 'employee_id' | 'avatar'>>;
export async function updateEmployeeData(id: number, payload: UpdateEmployeeDataPayload): Promise<EmployeeData> {
  try {
    const response = await api.post<EmployeeData>(`/api/employee/update/data/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados adicionais do colaborador.');
  }
}


export type UpdateEmployeeAddressPayload = Partial<Omit<EmployeeAddress, 'id' | 'employee_id'>>;
export async function updateEmployeeAddress(id: number, payload: UpdateEmployeeAddressPayload): Promise<EmployeeAddress> {
  try {
    const response = await api.post<EmployeeAddress>(`/api/employee/update/address/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o endereço do colaborador.');
  }
}

export type UpdateEmployeeBankPayload = Partial<Omit<EmployeeBank, 'id' | 'employee_id'>>;
export async function updateEmployeeBank(id: number, payload: UpdateEmployeeBankPayload): Promise<EmployeeBank> {
  try {
    const response = await api.post<EmployeeBank>(`/api/employee/update/bank/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados bancários do colaborador.');
  }
}

export type CreateContractPayload = Omit<EmployeeContract, 'id' | 'sector' | 'active'>;
export async function createContract(payload: CreateContractPayload): Promise<EmployeeContract> {
  try {
    const response = await api.post<EmployeeContract>('/api/employee/contract/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o contrato.');
  }
}

export type UpdateContractPayload = Partial<Omit<EmployeeContract, 'id' | 'employee_id' | 'sector'>>;
export async function updateContract(contractId: number, payload: UpdateContractPayload): Promise<EmployeeContract> {
  try {
    // A API RESTful geralmente usa PUT ou PATCH para atualização. Usando POST como nos outros.
    const response = await api.post<EmployeeContract>(`/api/employee/contract/update/${contractId}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o contrato.');
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
    console.log(response.data);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar o colaborador.');
  } 
}