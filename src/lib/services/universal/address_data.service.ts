import api,{handleApiError} from "@/lib/axios";
import { useQuery } from "@tanstack/react-query"; // Keep useQuery

export interface ICity{
    id:number
    name:string
    state_id:number
}

export interface IState {
    id: number;
    name: string;
    uf: string;
}

export interface ICountry{
    id:number
    name:string
}

export interface AddressDataResponse {
    cities: ICity[];
    states: IState[];
    countries: ICountry[];
}

export async function getAddressData(): Promise<AddressDataResponse> {
    try {
        const response = await api.get<AddressDataResponse>('/api/generic/address-data'); 
        return response.data;
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar as cidades.');
    }
}


export function useAddressData() {
    return useQuery<AddressDataResponse>({
        queryKey: ['addressData'],
        queryFn: getAddressData,
        staleTime: 1000 * 60 * 60 * 24,      
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}
