import api, {handleApiError} from "@/lib/axios"


export async function getDre(start_date:string, end_date:string, company_id:number){
    try{
        const response = await api.get('/api/dre',{
            params:{
                start_date,
                end_date,
                company_id
            }
        })
        console.log(response.data)
        return response.data
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar o DRE.')
    }

}