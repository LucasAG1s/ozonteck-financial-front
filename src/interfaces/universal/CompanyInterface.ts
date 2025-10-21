
export interface ICompany {
  id: number;
  corporate_name: string;
  cnpj: string;
  phone_number: string | null;
  trade_name: string | null;
  type: string;
  address_line: string | null;
  city: string | null;
  complement: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  email: string | null;
}