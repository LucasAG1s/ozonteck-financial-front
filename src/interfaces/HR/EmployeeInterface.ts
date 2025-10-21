export interface IEmployeeData {
  id: number;
  employee_id: number;
  document_number: string;
  birth_date: string;
  marital_status: string;
  gender: string;
  avatar?: string;
}

export interface IEmployeeAddress {
  id: number;
  employee_id: number;
  address_line: string;
  complement: string | null;
  neighborhood: string;
  number: string;
  zip_code: string;
  city_id: number;
  state_id: number;
  country_id: number;
}

export interface IEmployeeBank {
  id: number;
  employee_id: number;
  bank_id: number;
  agency_number: number;
  account_number: number;
  account_type: string;
  pix_key: string;
}

export interface IEmployeePayments{
  id:number
  employee_id:number
  company_id:number
	type:String
  amount:string	
  reference_month: string; 
  paid_at: string; 
  }

export interface IEmployeeContract {
  id: number;
  employee_id: number;
  company_id: number;
  contract_type: string;
  admission_date: string;
  salary: string;
  position: string | null;
  active: number;
  sector_id: number;
  is_unionized: number; 
  work_schedule: string | null; 
  sector: { id: number; name: string; }; 
}

export interface IEmployee {
  id: number;
  name: string;
  phone: string;
  email: string;
  contracts: IEmployeeContract[];
  data: IEmployeeData;
  address: IEmployeeAddress;
  bank: IEmployeeBank; 
  payments: IEmployeePayments[]; 
  active: boolean; 
  created_at: string;
  updated_at: string;
}