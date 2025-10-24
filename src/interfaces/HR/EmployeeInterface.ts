export interface IEmployeeData {
  id: number
  employee_id: number
  document_number: string
  birth_date: string
  marital_status: string
  gender: string
  avatar?: string
}

export interface IEmployeeAddress {
  id: number
  employee_id: number
  address_line: string
  complement: string | null
  neighborhood: string
  number: string
  zip_code: string
  city_id: number | undefined
  state_id: number | undefined
  country_id: number | undefined
}

export interface IEmployeeBank {
  id: number
  employee_id: number
  bank_id: number
  agency_number: number
  account_number: number
  account_type: string
  pix_key: string
}

export interface IEmployeePayments{
  id:number
  employee_id:number
  company_id:number
  description:string
	type:String
  amount:string	
  reference_month: string 
  paid_at: string 
  }

export interface IEmployeeSalaryHistory {
  id: number;
  employee_id: number;
  employee_contract_id: number;
  salary: string;
  reference_month: string;
  effective_date: string;
}

export interface IEmployeeContract {
  id: number
  employee_id: number
  company_id: number
  contract_type: string
  admission_date: string
  salaries: IEmployeeSalaryHistory[]
  salary:string
  position: string | null
  active: number
  sector_id: number
  is_unionized: number 
  work_schedule: string | null 
  sector: { id: number, name: string } 
}

export interface IEmployee {
  id: number
  name: string
  admission_date:string
  phone: string
  description:string
  email: string
  contracts: IEmployeeContract[]
  data: IEmployeeData
  address: IEmployeeAddress
  bank: IEmployeeBank
  payments: IEmployeePayments[] 
  active: boolean
  created_at: string
  updated_at: string
}

export interface IEmployeePayment{
  id:number
  employee_id:number
  type:string
  amount:string
  company_id:number
  reference_month:string
  paid_at:string
  description:string | null
}

export interface IEmployeePaymentSummary {
  employee_id: number
  name: string
  contract_id: number
  salary: string
  total_advanced: string
  balance_due: string
  bank_name: string
  advances_details: {
    id: number
    amount: number
    date: string
    description: string
  }[]
}

export interface IEmployeePaymentCreate{
  employee_id:number
  company_id:number
  type:string
  amount:string
  bank_account_id:number
  description:string | undefined
  reference_month:string
  payment_method_id:number
  paid_at:string
  account_plan_id:number
}


export interface ISettleAllPaymentsPayload {
  company_id: number
  payment_method_id: number
  reference_month: string
  bank_account_id: number
  account_plan_id: number
  paid_at: string
}

export interface ISettlePaymentPayload {
  bank_account_id: number
  company_id:number
  paid_at: string
  account_plan_id: number,
  payment_method_id: number
  reference_month: string
}