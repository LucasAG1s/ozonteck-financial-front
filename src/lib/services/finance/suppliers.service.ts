import api, { handleApiError } from "@/lib/axios";

export interface Supplier {
  id: number;
  name: string;
  document: string; 
  email: string;
  status: 'ativo' | 'inativo';
  phone: string;
  created_at: string;
  updated_at: string;
}

export type CreateSupplierPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;


export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const response = await api.get<Supplier[]>('/api/supplier');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar os fornecedores.');
  }
}

export async function getSupplierById(id: string): Promise<Supplier> {
  try {
    const response = await api.get<Supplier>(`/api/supplier/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao buscar o fornecedor.');
  }
}


export async function createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
  try {
    const response = await api.post<Supplier>('/api/supplier/create', payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao criar o fornecedor.');
  }
}


export async function updateSupplier(id: number, payload: UpdateSupplierPayload): Promise<Supplier> {
  try {
    const response = await api.post<Supplier>(`/api/suppliers/update/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao atualizar o fornecedor.');
  }
}


export async function deleteSupplier(id: number): Promise<void> {
  try {
    await api.delete(`/api/suppliers/delete/${id}`);
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao excluir o fornecedor.');
  }
}