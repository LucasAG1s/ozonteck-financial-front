import api,{handleApiError} from "@/lib/axios";



export interface Employee{
    id:number
    company_id:number
    name:string
    email:string
    phone:number
    position:string
    sector_id:string
    base_salary:string

}

export interface Sector {
    id:number
    name:string
    description:string
    created_at:string
    updated_at:string
}


export type createEmployeePayload = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type updateEmployeePayload = Partial<createEmployeePayload>;


export async function getEmployees(company:number): Promise<Employee[]> {
    try{
        const response = await api.get<Employee[]>(`/api/employee/${company}`);
        return response.data;
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar os funcionários.');
    }
}


export async function getSectors(): Promise<Sector[]> {
    try{
        const response = await api.get<Sector[]>('/api/sector');
        return response.data;
    }catch(error){
        throw handleApiError(error, 'Ocorreu um erro ao buscar os setores.');
    }
}
