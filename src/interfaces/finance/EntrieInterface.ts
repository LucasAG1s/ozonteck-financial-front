import { IBankAccount } from "./BankAccountInterface";


interface IEntryCompany {
  id: number;
  corporate_name: string;
}

interface IEntryAccountPlan {
  id: number;
  name: string;
}

export interface IEntrie {
  id: number
  company_id: number
  bank_account_id: number
  account_plan_id: number | null
  origin: string
  amount: string
  entry_date: string
  description: string
  created_at: string
  updated_at: string
  company: IEntryCompany
  account_plan: IEntryAccountPlan | null
  bank: IBankAccount | null
}
