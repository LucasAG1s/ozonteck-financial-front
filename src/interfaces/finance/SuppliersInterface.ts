export interface ISupplier {
  id: number
  fantasy_name: string
  company_name:string
  document: string
  email: string
  active: number| boolean
  phone: string
  created_at: string
  updated_at: string
}

export interface ISupplierAddress{
  id:number
  supplier_id:number
  address_line:string
  complement:string | null
  district:string
  neighborhood:string
  number:string
  zip_code:string
  city_id:number | null
  state_id:number
  country_id:number
}

export interface ISupplierBank{
  id:number
  agency:number
  supplier_id:number
  bank_id:number
  account:number
  account_type:string
  pix_key:string | null
}


export interface ISupplierData{
  id:number
  supplier_id:number
  state_registration:number | null
  cnpj:string | null
  municipal_registration:number | null
  tax_regime: 'SN' | 'LP' | 'LR' | 'ME' | 'LA' | 'MEI' | null
  crt_code: '1' | '2' | '3' | '4' | null
}

export interface ISupplierEdit{
  id:number
  fantasy_name:string
  company_name:string
  document:string
  email:string
  active:boolean | undefined
  phone:string
  created_at:string
  updated_at:string
  data:ISupplierData
  address:ISupplierAddress
  bank:ISupplierBank
  expenses:any[]
  observations:ISupplierObservation[]
}

export interface ISupplierObservation{
  id:number
  observation:string
  created_at:string
  updated_at:string
  operator_id:number
  operator:{
    name:string
  }
}
