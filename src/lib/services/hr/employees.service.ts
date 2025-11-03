import api, { handleApiError } from "@/lib/axios";
import { 
  IEmployee,
  IEmployeeAddress,
  IEmployeeBank,
  IEmployeeContract,
  IEmployeeData,
  IEmployeeSalaryHistory,
  IEmployeePayment,
  IEmployeePaymentSummary,
  ISettleAllPaymentsPayload,
  ISettlePaymentPayload,
  IEmployeeFiles,
  IEmployeeObservations
} from "@/interfaces/HR/EmployeeInterface";

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


export type CreateEmployeePayload = Omit<IEmployee, 'id' | 'created_at' | 'updated_at' | 'contracts' | 'data' | 'address' | 'bank' | 'payments' | 'files' | 'observations' | 'description'> & { document_number?: string; avatar?: File | null };
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;


export async function getEmployees(companyId: number): Promise<IEmployee[]> {
  try {
    const response = await api.get<IEmployee[]>('/api/employee', {
      params: {
        company_id: companyId
      }
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os colaboradores.');
  }
}


export async function createEmployee(payload: CreateEmployeePayload): Promise<IEmployee> {
  try {
    const data = buildFormData(payload);
    const response = await api.post<IEmployee>('/api/employee/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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

export type UpdateContractPayload = Partial<Omit<IEmployeeContract, 'id' | 'employee_id' | 'sector' | 'salary' | 'salaries'>>;
export async function updateContract(contractId: number, payload: UpdateContractPayload): Promise<IEmployeeContract> {
  try {
    const response = await api.post<IEmployeeContract>(`/api/employee/contract/update/${contractId}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o contrato.');
  }
}

export type CreateSalaryPayload = Omit<IEmployeeSalaryHistory, 'id'>;

export async function createSalary(payload: CreateSalaryPayload): Promise<IEmployeeSalaryHistory> {
  try {
    const response = await api.post<IEmployeeSalaryHistory>('/api/employee/salary/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao registrar o novo salário.');
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
    await api.delete(`/api/employee/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o colaborador.');
  }
}

export async function getEmployeeById(id: number): Promise<IEmployee> {
  try {
    const response = await api.get<IEmployee>(`/api/employee/edit/${id}`);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar o colaborador.');
  } 
}

export type CreateEmployeePaymentPayload = Omit<IEmployeePayment, 'id'>;
export async function createEmployeePayment(payload: CreateEmployeePaymentPayload): Promise<IEmployeePayment> {
  try {
    const response = await api.post<IEmployeePayment>('/api/employee-payment/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao registrar o pagamento do colaborador.');
  }
}


export async function getPaymentsData(companyId:number, reference_month:string): Promise<IEmployeePaymentSummary[]>{
  try{
    const response = await api.get(`/api/employee-payment/${companyId}`,{
      params:{
        reference_month
      }
    })
    return response.data
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao buscar os dados de pagamento.');
  }
}


export async function settleEmployeePayment(employeeId: number, payload: ISettlePaymentPayload): Promise<void> {
  try {
    await api.post(`/api/employee-payment/settle-payment/${employeeId}`, payload);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao fechar a folha do colaborador.');
  }
}


export async function settleAllEmployeePayments(company_id:number,payload: ISettleAllPaymentsPayload): Promise<void> {
  try {
    await api.post(`/api/employee-payment/settle-all-payments/${company_id}`, payload);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao fechar a folha de todos os colaboradores.');
  }
}


export type CreateEmployeeFilePayload = Omit<IEmployeeFiles, 'id' | 'created_at' | 'updated_at'|'path'|'size'|'mime_type'>
export async function createFile(employee_id:number,payload:CreateEmployeeFilePayload):Promise<IEmployeeFiles>{
  try{
    const data = buildFormData(payload);
    const response = await api.post(`/api/employee/files/create/${employee_id}`,data,{
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao criar o arquivo.');
  }
}

export async function deleteFile(id:number):Promise<void>{
  try{
    await api.delete(`/api/employee/files/delete/${id}`)
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao excluir o arquivo.');
  }
}

type CreateEmployeeObservation = Omit<IEmployeeObservations, 'id'|'created_at'|'updated_at'|'operator_id'|'operator'>
export async function createEmployeeObservations(employee_id:number,payload:CreateEmployeeObservation)
{
  try{
    const response = await api.post(`/api/employee/observations/create/${employee_id}`,payload)
    return response.data
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao criar a observação.');
  }
}