import api, { handleApiError } from '@/lib/axios'
import { IPaymentMethod } from '@/interfaces/finance/PaymentMethodInterface';


export type CreatePaymentMethodPayload = Omit<IPaymentMethod, 'id' | 'created_at' | 'updated_at'>
export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>


export async function getPaymentMethods(): Promise<IPaymentMethod[]>{
    try{
        const response = await api.get<IPaymentMethod[]>('/api/payment-method');
        return response.data;
    } catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar os métodos de pagamento.')
    } 
}