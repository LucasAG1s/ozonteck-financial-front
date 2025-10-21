import api, {handleApiError} from "@/lib/axios";
import { ISector } from "@/interfaces/HR/SectorInterface";



export async function getSectors(companyId:number): Promise<ISector[]> {
    try {
        const response = await api.get<ISector[]>('/api/sector', {
            params: {
                company_id: companyId
            }
        }); 
        return response.data
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar os setores.');
    }
}
