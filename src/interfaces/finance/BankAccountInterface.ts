export interface IBank{
    id:number
    name:string
    code:number
    updated_at:string
    created_at:string
}


export interface IBankAccount{
    id:number
    company_id:number
    description:string |null | undefined
    bank_id:number
    banks:IBank
    account:string
    agency:string
    account_type:string
}