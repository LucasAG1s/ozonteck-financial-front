
export interface ICompany {
  id: number;
  corporate_name: string;
  cnpj: string;
  phone_number: string | null;
  trade_name: string | null;
  type: 'matriz' | 'filial';
  address_line: string | null;
  complement: string | null;
  zipcode: string | null;
  city_id: number | null;
  state_id: number | null;
  country_id: number | null;
  email: string | null;
}