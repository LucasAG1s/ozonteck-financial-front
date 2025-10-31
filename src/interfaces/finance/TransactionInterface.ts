export interface ITransaction {
  id:number
  transaction_date: string;
  description: string;
  type: 'credit' | 'debit'
  amount: number
  balance_previous:number
  balance_later:number
}

export interface ITransactionsData {
  initial_balance: string;
  final_balance: string;
  total_entries: string;
  total_expenses: string;
  transactions: ITransaction[];
}