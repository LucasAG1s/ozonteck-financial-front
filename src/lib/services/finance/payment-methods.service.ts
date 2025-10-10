import api, { handleApiError } from '@/lib/axios'


export interface PaymentMethod{
    id:number
    name:string
    created_at:string
    updated_at:string
}

export type CreatePaymentMethodPayload = Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>
export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>


export async function getPaymentMethods(): Promise<PaymentMethod[]>{
    try{
        const response = await api.get<PaymentMethod[]>('/api/payment-method');
        return response.data;
    } catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar os métodos de pagamento.')
    } 
}