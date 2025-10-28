import api, { handleApiError } from "@/lib/axios";
import { ISupplierBank, ISupplier, ISupplierAddress, ISupplierData, ISupplierEdit, ISupplierObservation } from "@/interfaces/finance/SuppliersInterface";


export type CreateSupplierPayload = Omit<ISupplier, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;


export async function getSuppliers(): Promise<ISupplier[]> {
  try {
    const response = await api.get<ISupplier[]>('/api/supplier');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os fornecedores.');
  }
}

export async function getSupplierById(id: string): Promise<ISupplierEdit> {
  try {
    const response = await api.get<ISupplierEdit>(`/api/supplier/edit/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar o fornecedor.');
  }
}


export async function createSupplier(payload: CreateSupplierPayload): Promise<ISupplier> {
  try {
    const response = await api.post<ISupplier>('/api/supplier/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o fornecedor.');
  }
}


export async function updateSupplier(id: number, payload: UpdateSupplierPayload): Promise<ISupplier> {
  try {
    const response = await api.post<ISupplier>(`/api/supplier/update/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o fornecedor.');
  }
}

export async function deleteSupplier(id: number): Promise<void> {
  try {
    await api.delete(`/api/supplier/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o fornecedor.');
  }
}

export async function updateSupplierData(id: number, payload: ISupplierData): Promise<ISupplierData>{
  try {
    const response = await api.post<ISupplierData>(`/api/supplier/update-data/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar os dados do fornecedor.');
  }
}

export type UpdateSupplierAddressPayload = Partial<Omit<ISupplierAddress, 'id' | 'supplier_id'>>;
export async function updateSupplierAddress(id: number, payload: UpdateSupplierAddressPayload): Promise<ISupplierAddress>{
  try {
    const response = await api.post<ISupplierAddress>(`/api/supplier/update-address/${id}`, payload);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o endereço do fornecedor.');
  }
}

export type UpdateSupplierBankPayload = Partial<Omit<ISupplierBank, 'id' | 'supplier_id'>>;
export async function updateSupplierBank(id: number, payload: UpdateSupplierBankPayload): Promise<ISupplierBank>{
  try {
    const response = await api.post<ISupplierBank>(`/api/supplier/update-bank/${id}`, payload);
    return response.data;
  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o banco do fornecedor.');
  }
}


export type createObservationPayload = Omit<ISupplierObservation, 'id' | 'created_at' | 'updated_at' | 'operator_id'|'operator'>
export async function createSupplierObservation(supplier_id:number,payload:createObservationPayload){
  try{
    const response = await api.post(`/api/supplier/observations/create/${supplier_id}`,payload)
    return response.data

  }catch(error){
    throw handleApiError(error, 'Ocorreu um erro ao criar a observação.');
  }
}