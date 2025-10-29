import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useCompanies } from '@/hooks/useCompanies';
import { getCashFlow } from '@/lib/services/finance/cash-flow.service';
import { ICashFlowData } from '@/interfaces/finance/CashFlowInterface';
import { getBanksAccount } from '@/lib/services/finance/banks-account.service';
import { DateRangeFilter } from '@/components/ui/dateRangeFilter';
import { formatCurrency, formatDate, formatBankAccount } from '@/lib/utils';
import { TrendingUp, TrendingDown, Scale, Wallet, Filter, Info, AlertCircle } from 'lucide-react';

export function CashFlow() {
  const { selectedCompany } = useCompanies();
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [bankAccountId, setBankAccountId] = useState<number | null>(null);

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['bankAccounts', selectedCompany?.id],
    queryFn: () => getBanksAccount(selectedCompany!.id),
    enabled: !!selectedCompany?.id,
  });

   useEffect(() => {
    if (bankAccounts.length > 0 && !bankAccounts.some(acc => acc.id === bankAccountId)) {
      setBankAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts]);

  const { data, isLoading, isError, error } = useQuery<ICashFlowData>({
    queryKey: ['cashFlow', selectedCompany?.id, startDate, endDate, bankAccountId],
    queryFn: () => getCashFlow(startDate, endDate, selectedCompany!.id, bankAccountId),
    enabled: !!selectedCompany?.id && !!bankAccountId, 
    staleTime: 1000 * 60,
  });

  const transactionsWithBalance = useMemo(() => {
    if (!data) return [];
    let runningBalance = parseFloat(data.initial_balance);
    return data.transactions.map(transaction => {
      const value = transaction.amount;
      const currentBalance = transaction.balance_later;
      runningBalance += (transaction.type === 'credit' ? value : -value);
      return { ...transaction, runningBalance: currentBalance, finalBalance: runningBalance };
    });
  }, [data]);

  const isComponentLoading = isLoading || isLoadingBanks;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Período</Label>
            <DateRangeFilter startDate={startDate} endDate={endDate} onFilter={(start, end) => { setStartDate(start); setEndDate(end); }} />
          </div>
          <div>
            <Label>Conta Bancária</Label>
            <Select onValueChange={(value) => setBankAccountId(Number(value))} value={String(bankAccountId ?? '')} disabled={isLoadingBanks || bankAccounts.length === 0}>
              <SelectTrigger><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
              <SelectContent>
                {bankAccounts.map(bank => <SelectItem key={bank.id} value={String(bank.id)}>{ bank.banks.name + ' - ' + formatBankAccount(bank.account)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isComponentLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) : (
          <>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(Number(data?.initial_balance ?? 0))}</div></CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Entradas</CardTitle><TrendingUp className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(Number(data?.total_entries ?? 0))}</div></CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Saídas</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(Number(data?.total_expenses ?? 0))}</div></CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Saldo Final</CardTitle><Wallet className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(Number(data?.final_balance ?? 0))}</div></CardContent></Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Extrato de Transações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Saldo Anterior</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo Posterior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isComponentLoading && Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)}
              {isError && <TableRow><TableCell colSpan={5} className="text-center text-destructive py-4"><AlertCircle className="inline h-5 w-5 mr-2" />{error.message}</TableCell></TableRow>}
              {!isComponentLoading && !isError && transactionsWithBalance.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4"><Info className="inline h-5 w-5 mr-2" />Nenhuma transação encontrada para o período.</TableCell></TableRow>}
              {transactionsWithBalance.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(new Date(transaction.date))}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell className={`text-right ${transaction.type ==='credit' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transaction.balance_previous)}</TableCell>
                  <TableCell className={`text-right ${transaction.type ==='credit' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className={`text-right ${transaction.type ==='credit' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transaction.balance_later)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
