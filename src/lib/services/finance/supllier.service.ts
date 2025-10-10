import api,{handleApiError} from "@/lib/axios";


export interface Supplier {
    id:number
    name:string
    document:number
    email:string
    phone:number
    created_at:string
    updated_at:string
}


export type createSupplierPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
export type updateSupplierPayload = Partial<createSupplierPayload>;


export async function getSuppliers(): Promise<Supplier[]>
{
    try{
        const response = await api.get<Supplier[]>('/api/supplier');
        return response.data;
    }catch(error){
       throw handleApiError(error, 'Ocorreu um erro ao buscar os fornecedores.');
    }
}

