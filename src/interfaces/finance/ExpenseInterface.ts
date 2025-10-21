import { ISupplier } from "./SuppliersInterface"
import { IAccountPlan } from "./AccountPlanInterface"
import { IBankAccount } from "./BankAccountInterface"
import { IPaymentMethod } from "./PaymentMethodInterface"


export interface IExpense {
    id:number
    company_id:number
    supplier_id:number
    bank_account_id:number
    account_plan_id:number
    payment_method_id:number
    amount:string
    expense_date:string
    description:string
    file_path:string 
    created_at:string
    updated_at:string
    supplier: ISupplier | null
    account_plan: IAccountPlan | null
    payment_method: IPaymentMethod | null
    bank: IBankAccount | null
}