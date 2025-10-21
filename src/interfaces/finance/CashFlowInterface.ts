interface ITransaction {
  date: string;
  description: string;
  type: 'credit' | 'debit'
  type_label: 'Entrada' | 'Saída'
  amount: number
  balance_previous:number
  balance_later:number
}

export interface ICashFlowData {
  initial_balance: string;
  final_balance: string;
  total_entries: string;
  total_expenses: string;
  transactions: ITransaction[];
}