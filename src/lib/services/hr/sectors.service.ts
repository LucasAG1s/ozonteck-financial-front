import api, {handleApiError} from "@/lib/axios";


export interface Sector{
    id:number
    company_id:number
    name:string
    created_at:string
    updated_at:string
}



export async function getSectors(companyId:number): Promise<Sector[]> {
    try {
        const response = await api.get<Sector[]>('/api/sector', {
            params: {
                company_id: companyId
            }
        }); 

        return response.data
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar os setores.');
    }
}
